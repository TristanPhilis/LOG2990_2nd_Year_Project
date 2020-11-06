import { Application } from '@app/app';
import { DatabaseService } from '@app/services/database/database.service';
import { IndexService } from '@app/services/index.service';
import { TYPES } from '@app/types';
import { DrawingInfo } from '@common/communication/drawing-info';
import { expect } from 'chai';
import * as Httpstatus from 'http-status-codes';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';

// tslint:disable:no-any

describe('IndexController', () => {
    const baseDrawing: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' };
    let indexService: Stubbed<IndexService>;
    let databaseService: Stubbed<DatabaseService>;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.IndexService).toConstantValue({
            deleteDrawing: sandbox.stub().resolves(baseDrawing),
            storeDrawing: sandbox.stub().resolves(),
            getAllDrawings: sandbox.stub().resolves([baseDrawing, baseDrawing]),
        });

        container.rebind(TYPES.DatabaseService).toConstantValue({
            deleteDrawing: sandbox.stub().resolves(),
            addDrawing: sandbox.stub().resolves(),
            getAllDrawings: sandbox.stub().resolves([baseDrawing, baseDrawing]),
            getDrawing: sandbox.stub().resolves(baseDrawing),
            start: sandbox.stub().resolves(),
            closeConnection: sandbox.stub().resolves(),
        });
        databaseService = container.get(TYPES.DatabaseService);
        indexService = container.get(TYPES.IndexService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return drawing from index service on valid get request to root', async () => {
        return supertest(app)
            .get('/api/index')
            .expect(Httpstatus.StatusCodes.OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(baseDrawing);
            });
    });

    it('should return deletedDrawing from index service on valid delete request to root', async () => {
        return supertest(app).del('/api/index/992').set('Accept', 'application/json').expect(Httpstatus.StatusCodes.OK);
    });

    it('should store drawing in the array on valid post request to /send', async () => {
        const drawing: DrawingInfo = { id: 997, name: '', tags: [], metadata: '' };
        return supertest(app).post('/api/index/send').send(drawing).set('Accept', 'application/json').expect(Httpstatus.StatusCodes.CREATED);
    });

    it('should return an array of drawings on valid get request to /all', async () => {
        indexService.getAllDrawings.returns([baseDrawing, baseDrawing]);
        return supertest(app)
            .get('/api/index/all')
            .expect(Httpstatus.StatusCodes.OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([baseDrawing, baseDrawing]);
            });
    });

    // tslint:disable-next-line: promise-function-async
    it('should throw', () => {
        databaseService.deleteDrawing.usingPromise(Promise).rejects('error');

        return supertest(app)
            .del('/api/index/992')
            .then((response: any) => {
                expect(response.statusCode).to.deep.equal(Httpstatus.StatusCodes.NOT_FOUND);
            })
            .catch((error) => {
                throw error;
            });
    });
});
