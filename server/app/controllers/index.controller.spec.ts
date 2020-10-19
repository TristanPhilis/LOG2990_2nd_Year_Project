 import { Application } from '@app/app';
import { IndexService } from '@app/services/index.service';
import { TYPES } from '@app/types';
import { expect } from 'chai';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { DrawingInfo } from '@common/communication/drawing-info';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;

describe('IndexController', () => {
    const baseDrawing: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' };
    let indexService: Stubbed<IndexService>;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.IndexService).toConstantValue({
            deleteDrawings: sandbox.stub().resolves(baseDrawing),
            storeDrawing: sandbox.stub().resolves(),
            getAllDrawingss: sandbox.stub().resolves([baseDrawing, baseDrawing]),
        });
        indexService = container.get(TYPES.IndexService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return drawing from index service on valid get request to root', async () => {
        return supertest(app)
            .get('/api/index')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(baseDrawing);
            });
    });

    it('should store drawing in the array on valid post request to /send', async () => {
        const drawing: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' }
        return supertest(app).post('/api/index/send').send(drawing).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
    });

    it('should return an array of drawings on valid get request to /all', async () => {
        indexService.getAllDrawings.returns([baseDrawing, baseDrawing]);
        return supertest(app)
            .get('/api/index/all')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([baseDrawing, baseDrawing]);
            });
    });
});
