import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import toStream = require('buffer-to-stream');

import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'tracer' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            toStream(file.buffer).pipe(uploadStream);
        });
    }

    uploadFiles(files: Express.Multer.File[]): Promise<CloudinaryResponse[]> {
        return Promise.all(files.map(this.uploadFile));
    }
}
