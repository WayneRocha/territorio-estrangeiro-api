import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';
// import * as crypto from "crypto";
// import * as fs from 'fs'; //when debug
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/firestore/firebase';

/* IMPORTS */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        if (crypto) {
            res.status(200).send("|crypto");
        }
        if (!!axios) {
            res.status(200).send("|axios");
        }
        if (!!ref && !!uploadBytesResumable && !!getDownloadURL && storage) {
            res.status(200).send("|firebase");
        }
        res.status(200).send("all deps exists");
        
    } catch (error) {
        res.status(200).send("error: "+error);

    } finally {
        res.end();
    }

}