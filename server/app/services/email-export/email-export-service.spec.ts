import { TYPES } from '@app/types';

import { EmailInfo } from '@common/communication/email-info';
import { testingContainer } from '../../../test/test-utils';

import { EmailExportService } from '@app/services/email-export/email-export-service.ts';
import { fail } from 'assert';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { EMAIL_RESPONSE } from '@app/const';

describe('EmailExportService', () => {
    let emailExportService: EmailExportService;

    chai.use(chaiAsPromised);
    const expect = chai.expect;

    beforeEach(async () => {
        const [container] = await testingContainer();
        emailExportService = container.get<EmailExportService>(TYPES.EmailExportService);
    });

    it('should correctly send PNG file to existant address', async () => {
        const validEmail: EmailInfo = {
            emailAddress: 'ramzibelbahri@gmail.com',
            metadata: '',
            fileExtension: 'png',
            fileName: 'image.png',
        };
        try {
            await emailExportService.sendEmail(validEmail);
            fail('Method should have thrown');
        } catch (error) {
            expect(error.message).to.equal(EMAIL_RESPONSE.INCORRECT_FILE);
        }
    });

    it('should correctly send JPEG file to existant address', async () => {
        const validJPEGEmail: EmailInfo = {
            emailAddress: 'ramzibelbahri@gmail.com',
            metadata: '',
            fileExtension: 'jpeg',
            fileName: 'image.jpeg',
        };
        try {
            await emailExportService.sendEmail(validJPEGEmail);
            fail('Method should have thrown');
        } catch (error) {
            expect(error.message).to.equal(EMAIL_RESPONSE.INCORRECT_FILE);
        }
    });

    it('should not correctly send file to in-existant address', async () => {
        const invalidEmailAddress: EmailInfo = {
            emailAddress: 'user',
            metadata: '',
            fileExtension: 'jpeg',
            fileName: 'image.jpeg',
        };
        try {
            await emailExportService.sendEmail(invalidEmailAddress);
            fail('Method should have thrown');
        } catch (error) {
            expect(error.message).to.equal(EMAIL_RESPONSE.INCORRECT_ADDRESS);
        }
    });

    it('should validate email address correctly', async ()=> {
        expect(emailExportService.isValidEmailAddress('ramzi.belbahri@gmail.com')).to.equal(true);
        expect(emailExportService.isValidEmailAddress('ramzi.belbahricom')).to.equal(false);
    });

    it('should validate file content correctly', async ()=> {
        let buff = Buffer.from('','base64');
        expect(emailExportService.validateFile('img', buff)).to.equal(false);
    });
});
