// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

/* IMPORTS */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {

        const AdmZip = require('adm-zip');

        res.status(200).send("all adm-zip");
        
    } catch (error) {
        res.status(200).send("error: "+error);

    } finally {
        res.end();
        return;
    }

}