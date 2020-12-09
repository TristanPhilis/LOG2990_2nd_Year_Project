import { EmailExportService } from '@app/services/email-export/email-export-service';
import { TYPES } from '@app/types';
import { EmailInfo } from '@common/communication/email-info';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class EmailController {
    router: Router;

    constructor(@inject(TYPES.EmailExportService) private emailExportService: EmailExportService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            const emailDrawing: EmailInfo = req.body;
            this.emailExportService.sendEmail(emailDrawing).then((returnValue: string) => {
                res.send(returnValue);
            });
        });
    }
}
