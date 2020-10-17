import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DrawingInfo } from '@common/communication/drawing-info';
import { IndexService } from './index.service';

describe('IndexService', () => {
    let httpMock: HttpTestingController;
    let service: IndexService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(IndexService);
        httpMock = TestBed.inject(HttpTestingController);
        // BASE_URL is private so we need to access it with its name as a key
        // Try to avoid this syntax which violates encapsulation
        // tslint:disable: no-string-literal
        baseUrl = service['BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return expected drawing (HttpClient called once)', () => {
        const expectedDrawing: DrawingInfo = { id: 999, name: 'CreatedDrawing', tags: ['new', 'draw'], metadata: '' };
        // tslint:disable-next-line: no-empty
        service.postDrawing(expectedDrawing).subscribe(() => {}, fail);
        // check the content of the mocked call
        service.getDrawing(expectedDrawing.id).subscribe((response: DrawingInfo) => {
            expect(response.id).toEqual(expectedDrawing.id, 'Id check');
            expect(response.name).toEqual(expectedDrawing.name, 'name check');
            expect(response.tags).toEqual(expectedDrawing.tags, 'tags check');
            expect(response.metadata).toEqual(expectedDrawing.metadata, 'metadata check');
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/' + expectedDrawing.id);
        const postReq = httpMock.expectOne(baseUrl + '/send');
        expect(postReq.request.method).toBe('POST');
        expect(req.request.method).toBe('GET');
        // service.deleteDrawing(expectedDrawing.id).subscribe();
        // actually send the request
        req.flush(expectedDrawing);
        postReq.flush(expectedDrawing);
    });

    it('should not return any drawing when sending a POST request (HttpClient called once)', () => {
        const sentDrawing: DrawingInfo = { id: 999, name: 'CreatedDrawing', tags: ['new', 'draw'], metadata: '' };
        // subscribe to the mocked call
        // tslint:disable-next-line: no-empty
        service.postDrawing(sentDrawing).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/send');
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentDrawing);
        service.deleteDrawing(sentDrawing.id).subscribe(() => {}, fail);
        const delReq = httpMock.expectOne(baseUrl + '/' + sentDrawing.id);
        expect(delReq.request.method).toBe('DELETE');
    });

    it('should return all drawings in server', () => {
        const sentDrawings: DrawingInfo[] = [
            { id: 997, name: 'CreatedDrawing1', tags: ['new', 'draw1'], metadata: '' },
            { id: 998, name: 'CreatedDrawing2', tags: ['new', 'draw2'], metadata: '' },
            { id: 999, name: 'CreatedDrawing3', tags: ['new', 'draw3'], metadata: '' },
        ];

        for (const sentDrawing of sentDrawings) {
          service.postDrawing(sentDrawing).subscribe(() => {}, fail);
          const postReq = httpMock.expectOne(baseUrl + '/send');
          postReq.flush(sentDrawing);
        }

        service.getAllDrawings().subscribe((responses: DrawingInfo[]) => {
            for (const sentDrawing of sentDrawings) {
                for (const response of responses) {
                    if (response.id === sentDrawing.id) {
                        expect(response.name).toEqual(sentDrawing.name, 'name check');
                        expect(response.tags).toEqual(sentDrawing.tags, 'tags check');
                        expect(response.metadata).toEqual(sentDrawing.metadata, 'metadata check');
                    }
                }
            }
        }, fail);
        const getReq = httpMock.expectOne(baseUrl + '/all');
        expect(getReq.request.method).toBe('GET');
        getReq.flush(sentDrawings);
    });

    it('should handle http error safely', () => {
        const sentDrawing: DrawingInfo = { id: 999, name: 'CreatedDrawing', tags: ['new', 'draw'], metadata: '' };
        service.getDrawing(sentDrawing.id).subscribe((response: DrawingInfo) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/' + sentDrawing.id);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occured'));
    });
});
