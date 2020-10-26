import { DatabaseService } from '@app/services/database/database.service';
import { TYPES } from '@app/types';
import { DrawingInfo } from '@common/communication/drawing-info';
import { NextFunction, Request, Response, Router } from 'express';
import * as Httpstatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { IndexService } from '../services/index.service';


@injectable()
export class IndexController {
    router: Router;

    constructor(
        @inject(TYPES.IndexService) private indexService: IndexService,
        @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    ) {
        this.configureRouter();
        this.databaseService.start();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            // const time: Message = await this.indexService.helloWorld();
            // res.json(time);
            this.databaseService
                .getAllDrawings()
                .then((drawings: DrawingInfo[]) => {
                    for (const drawing of drawings) {
                        this.indexService.storeDrawing(drawing);
                    }
                    res.json(drawings);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.get('/about', async (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            // res.json(this.indexService.about());
            this.databaseService.populateDB();
            res.sendStatus(Httpstatus.StatusCodes.OK);
        });

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            // Send the request to the service and send the response
            // const time: Message = await this.indexService.helloWorld();
            // res.json(time);
            const id = parseInt(req.params.id);
            this.databaseService
                .getDrawing(id)
                .then((drawing: DrawingInfo) => {
                    this.indexService.storeDrawing(drawing);
                    res.json(drawing);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.post('/send', (req: Request, res: Response, next: NextFunction) => {
            console.log('hi');
            const drawingInfo: DrawingInfo = req.body;
            this.databaseService
                .addDrawing(drawingInfo)
                .then(() => {
                    // this.indexService.storeDrawing(drawingInfo);
                    res.sendStatus(Httpstatus.StatusCodes.CREATED);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
            const id = parseInt(req.params.id);
            this.databaseService
                .deleteDrawing(id)
                .then(() => {
                    this.indexService.deleteDrawing(id);
                    // res.sendStatus(Httpstatus.StatusCodes.NO_CONTENT);
                    res.json(id);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                    console.log(error);
                });
        });
    }
}
