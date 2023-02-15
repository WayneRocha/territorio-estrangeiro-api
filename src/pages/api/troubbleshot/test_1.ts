// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Printable } from '@/root/types';
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import * as crypto from "crypto";
// import * as fs from 'fs'; //when debug
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/firestore/firebase';

export const zipImages = async(imageUrls: {name?: string, url: string, imageExtension: string}[]): Promise<Buffer | null> => {
    const AdmZip = require('adm-zip');
  
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
    
/* IMPORTS */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {

        const b = await zipImages([
            {url: "https://www.adobe.com/express/feature/image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.png?width=750&format=png&optimize=medium", name: "arquivo", imageExtension: "png"}
        ]);

        res.send(b);
        res.end();

    } catch (error) {
        res.status(200).send("error: "+error);

    } finally {
        res.end();
        return;
    }

}