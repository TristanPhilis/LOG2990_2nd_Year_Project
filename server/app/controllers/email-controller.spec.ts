import { Application } from '@app/app';
import { TYPES } from '@app/types';
import { EmailInfo } from '@common/communication/email-info';
import * as Httpstatus from 'http-status-codes';

import * as supertest from 'supertest';
import { testingContainer } from '../../test/test-utils';
const VALID_EMAIL = '{"message":"Input passed verification: an email should be sent if everything goes smoothly."}';

describe('EmailController', () => {
    let app: Express.Application;
    const validEmail: EmailInfo = {
        emailAddress: 'ramzibelbahri@gmail.com',
        metadata: '',
        fileExtension: 'png',
        fileName: 'image.png',
    };

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.EmailExportService).toConstantValue({
            sendEmail: sandbox.stub().resolves(VALID_EMAIL),
            validateFile: sandbox.stub().resolves(),
            isValidEmailAddress: sandbox.stub().resolves(),
        });
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should send correct http status', async () => {
        return supertest(app).post('/api/email').send(validEmail).set('Accept', 'application/json').expect(Httpstatus.StatusCodes.OK);
    });
});
