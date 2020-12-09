// https://github.com/tran-simon/LOG2990-104/blob/master/server/app/services/email.service.ts

import { HttpException } from '@app/http-exception';
import { EmailInfo } from '@common/communication/email-info';
import { Buffer } from 'buffer';
import * as Httpstatus from 'http-status-codes';

import { injectable } from 'inversify';
import 'reflect-metadata';
import * as request from 'request';

import { EMAIL_RESPONSE } from '@app/const';

// Accessing buffer values automatically converts them in decimal, hence the conversion here
const DECIMAL_PNG_FIRST_INDEX = 0x89;
const DECIMAL_PNG_SECOND_INDEX = 0x50;
const DECIMAL_JPEG_FIRST_INDEX = 0xff;
const DECIMAL_JPEG_SECOND_INDEX = 0xd8;
@injectable()
export class EmailExportService {
    private readonly EMAIL_URL: string = 'http://log2990.step.polymtl.ca/email';
    private readonly EMAIL_API_PARAMETERS: string = '?address_validation=true&quick_return=true&dry_run=false';

    async sendEmail(email: EmailInfo): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let imageData = email.metadata;
            if (email.metadata.includes(',')) imageData = email.metadata.split(',')[1];
            const buff = Buffer.from(imageData, 'base64');
            const requestOptions = {
                method: 'POST',
                url: this.EMAIL_URL + this.EMAIL_API_PARAMETERS,
                headers: {
                    'x-team-key': process.env.API_KEY,
                    'content-type': 'multipart/form-Data',
                },
                formData: {
                    to: email.emailAddress,
                    payload: {
                        value: buff,
                        options: {
                            filename: email.fileName,
                            knownLength: buff.byteLength,
                            contentType: 'image/' + email.fileExtension,
                        },
                    },
                },
            };
            if (!this.isValidEmailAddressFunction(email.emailAddress))
                reject(new HttpException(Httpstatus.StatusCodes.UNPROCESSABLE_ENTITY, EMAIL_RESPONSE.INCORRECT_ADDRESS));
            if (!this.validateFile(email.fileExtension, buff))
                reject(new HttpException(Httpstatus.StatusCodes.UNPROCESSABLE_ENTITY, EMAIL_RESPONSE.INCORRECT_FILE));
            else {
                request(requestOptions, (err: string | undefined, response: { body: string }) => {
                    resolve(response.body);
                });
            }
        })
            .then()
            .catch((error: Error) => {
                throw error;
            });
    }

    validateFile(fileExtension: string, imageData: Buffer): boolean {
        switch (fileExtension) {
            case 'png':
                return imageData[0] === DECIMAL_PNG_FIRST_INDEX && imageData[1] === DECIMAL_PNG_SECOND_INDEX ? true : false;
            case 'jpeg':
                return imageData[0] === DECIMAL_JPEG_FIRST_INDEX && imageData[1] === DECIMAL_JPEG_SECOND_INDEX ? true : false;
            default:
                return false;
        }
    }

    isValidEmailAddress(emailAddress: string): boolean {
        return this.isValidEmailAddressFunction(emailAddress);
    }

    private isValidEmailAddressFunction(emailAddress: string): boolean {
        const regEx = /^\S+@\S+\.\S+$/i;
        if (regEx.test(emailAddress)) {
            return true;
        } else {
            return false;
        }
    }
}
