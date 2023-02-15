// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Printable } from '@/root/types';
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import * as crypto from "crypto";
import * as fs from 'fs';
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/firestore/firebase';

const AdmZip = require('adm-zip');

export const zipImages = async(imageUrls: {name?: string, url: string, imageExtension: string}[]): Promise<Buffer | null> => {
  const images: {name: string, data: Buffer}[] = [];

  await Promise.all(imageUrls.map((imageUrl) => {
    return new Promise(async(resolve) => {
      const imagePath = imageUrl["name"] && imageUrl["imageExtension"] ? (
        `${imageUrl["name"]}.${imageUrl["imageExtension"]}`
      ) : (
        `${crypto.createHash('sha256').update(imageUrl["url"]).digest('hex')}.${imageUrl["imageExtension"]}`
      );
      
      try {
        const response = await axios.get(imageUrl["url"], { responseType: 'stream' });
        
        const chunks = []
        for await (let chunk of response.data) {
          chunks.push(chunk);
        }
    
        const image: Buffer = Buffer.concat(chunks);
    
        if (image) {
          images.push({
            name: imagePath,
            data: image
          });
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        resolve(1);
      }
    });
  }));

  try {
    
    const zip = new AdmZip(); 

    for (const image of images) {
      zip.addFile(image.name, image.data);
    }

    return zip.toBuffer();

  } catch (error) {
    console.error(error);
    return null;
  }

};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body: Printable[] = req.body;
  
    const finalImages: {name: string, imageUrl: string}[] = [];
  
    for (const printable of body) {
      if (!isAPrintable(printable)) {
        res.status(301).json({"error": "invalid Payload"});
        return;
      }
  
      //edit image
  
      if (printable.map) {
        finalImages.push({name: `${printable.territory.name} ${printable.territory.number}`, imageUrl: printable.map});
      }
    }
  
    if (finalImages) {

      const zipWithPhotos = await zipImages(finalImages.map(img => ({name: img.name, url: img.imageUrl, imageExtension: "png"})));
      
      const path = `territory-exports/territory-${(new Date()).getTime()}.zip`;
      
      if (zipWithPhotos) {
        
        const fileRef = ref(storage, path);
        const {ref: reference}: UploadTaskSnapshot = await uploadBytesResumable(
          fileRef,
          zipWithPhotos,
          {
            contentType: "application/x-zip-compressed",
            cacheControl: "max-age=7200",
          }
        );

        const downloadUrl = await getDownloadURL(reference);

        res.status(200).send(downloadUrl);
        res.end();

        /* const dbgPath = `public/territory-${(new Date()).getTime()}.zip`;
        //debug
        if (zipWithPhotos) {
          fs.writeFile(dbgPath, zipWithPhotos, (err) => {
            if (err) throw err;
            console.log('File has been written');
          });
        } */

      } else {
        res.status(500).json({error: "internal server error"});
      }

    }
  
  } catch (error) {
    res.status(200).json({error: error});
  }
}

function isAPrintable(obj: any): obj is Printable {
  return [
    obj?.territory?.name,
    obj?.territory?.number,
    obj?.map !== undefined,
  ].every(v => v); 
}