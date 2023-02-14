// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Printable } from '@/root/types';
import type { NextApiRequest, NextApiResponse } from 'next'

const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const crypto = require('crypto');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body: Printable[] = req.body;

  const finalImages: string[] = [];

  for (const printable of body) {
    if (!isAPrintable(printable)) {
      res.status(301).json({"error": "invalid Payload"});
      return;
    }

    //edit image

    if (printable.map) {
      finalImages.push(printable.map);
    }
  }

  if (finalImages) {
    res.status(200).send(await downloadAndZipImages(finalImages));
    return;
  }

  res.end();
}

export const downloadAndZipImages = async(imageUrls: string[]): Promise<string | undefined> => {
  const images: {name: string, path: string}[] = [];

  // Download images and store them in an array
  for (let i = 0; i < imageUrls.length; i++) {
    const imagePath = `${crypto.createHash('sha256').update(imageUrls[i]).digest('hex')}.jpg`;
    const file = fs.createWriteStream(imagePath);
    images.push({
      name: imagePath,
      path: imagePath,
    });

    const response = await axios.get(imageUrls[i], { responseType: 'stream' });
    response.data.pipe(file);
  }

  try {
    await Promise.all(images.map((image) => new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (fs.existsSync(image.path)) {
          clearInterval(checkInterval);
          resolve(0);
        }
      }, 100);
    })));
    
    const zip = new AdmZip(); 
    images.forEach((image) => {
      zip.addLocalFile(image.path);
    });
    const fileName = `territories-${(new Date()).getTime()}.zip`;
    const zipPath = `public/${fileName}`;
    zip.writeZip(zipPath);
  
    // Clean up
    images.forEach((image) => {
      fs.unlinkSync(image.path);
    });

    return fileName;
  } catch (error) {
    console.error(error);
  }

};

function isAPrintable(obj: any): obj is Printable {
  return [
    typeof obj?.territory?.name === "string",
    typeof obj?.territory?.number === "string",
    Array.isArray(obj?.addressesWithLocation),
    Array.isArray(obj?.addressesWithoutLocation),
    obj?.map || obj?.map === null,
  ].every(v => v); 
}