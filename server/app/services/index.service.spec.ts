import { TYPES } from '@app/types';
import { DrawingInfo } from '@common/communication/drawing-info';
import { expect } from 'chai';
import { testingContainer } from '../../test/test-utils';
// import { DateService } from './date.service';
import { IndexService } from './index.service';

describe('Index service', () => {
    let indexService: IndexService;
    /*let dateService: Stubbed<DateService>;*/

    beforeEach(async () => {
        const [container] = await testingContainer();
        /*container.rebind(TYPES.DateService).toConstantValue({
            currentTime: sandbox.stub().resolves({
                title: 'Time',
                body: new Date(2020, 0, 10).toString(),
            }),
        });
        dateService = container.get(TYPES.DateService);*/
        indexService = container.get<IndexService>(TYPES.IndexService);
    });

    /*it('should return a simple message if #about is called', () => {
        const expectedTitle = 'Basic Server About Page';
        const expectedBody = 'Try calling helloWorld to get the time';
        // const aboutMessage = indexService.about();
        expect(aboutMessage.title).to.equals(expectedTitle);
        expect(aboutMessage.body).to.equals(expectedBody);
    });*/

    /*it('should return Hello World as title', (done: Mocha.Done) => {
        indexService.helloWorld().then((result: Message) => {
            expect(result.title).to.equals('Hello world');
            done();
        });
    });

    it('should have a body that starts with "Time is"', (done: Mocha.Done) => {
        indexService.helloWorld().then((result: Message) => {
            expect(result.body)
                .to.be.a('string')
                .and.satisfy((body: string) => body.startsWith('Time is'));
            done();
        });
    });*/


    it('should store a Drawing', (done: Mocha.Done) => {
        const newDrawing: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' };
        indexService.storeDrawing(newDrawing);
        expect(indexService.clientDrawings[0]).to.equals(newDrawing);
        done();
    });

    it('should delete a Drawing', (done: Mocha.Done) => {
        const newDrawing: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' };
        indexService.storeDrawing(newDrawing);
        expect(indexService.deleteDrawing(newDrawing.id).id).to.equals(newDrawing.id);
        expect(indexService.clientDrawings).to.be.empty;
        done();
    });

    it('should not delete a non-existent Drawing and return an empty drawing', (done: Mocha.Done) => {
        const newDrawing: DrawingInfo = { id: 993, name: '', tags: [], metadata: '' };
        const newDrawing2: DrawingInfo = { id: 994, name: '', tags: ['a'], metadata: '' };
        indexService.storeDrawing(newDrawing);
        indexService.storeDrawing(newDrawing2);
        indexService.deleteDrawing(995);
        expect(indexService.clientDrawings.length).to.equals(2);
        done();
    });

    it('should get all Drawings', (done: Mocha.Done) => {
        const newDrawing: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' };
        const newDrawing2: DrawingInfo = { id: 996, name: '', tags: [], metadata: '' };
        indexService.clientDrawings.push(newDrawing2);
        indexService.clientDrawings.push(newDrawing);
        const messages = indexService.getAllDrawings();
        expect(messages).to.equals(indexService.clientDrawings);
        done();
    });
});
