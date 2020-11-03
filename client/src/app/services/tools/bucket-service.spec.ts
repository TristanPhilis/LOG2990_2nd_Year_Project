import { TestBed } from '@angular/core/testing';
import { BoundingBox } from '@app/classes/bounding-box';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MAX_TOLERANCE, MIN_TOLERANCE, PIXEL_INTERVAL } from '@app/shared/constant';
import { BucketService } from './bucket-service';

// tslint:disable:no-any
describe('BucketServiceService', () => {
    let service: BucketService;
    let mouseRightClick: MouseEvent;
    let mouseLeftClick: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['fillCanvas', 'getImageData', 'isCoordInCanvas']);
        drawServiceSpy.getImageData.and.returnValue({
            data: new Uint8ClampedArray(),
            width: 0,
            height: 0,
        });
        ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData']);
        const canvasSize = 5;
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(BucketService);
        service.canvasSize = { x: canvasSize, y: canvasSize };
        const pixelNumber = canvasSize * canvasSize * PIXEL_INTERVAL;
        service.pixelsData = new Uint8ClampedArray(pixelNumber).fill(0);

        // tslint:disable-next-line:no-string-literal
        drawServiceSpy['baseCtx'] = ctxSpy;
        drawServiceSpy.canvas = canvasTestHelper.canvas;
        mouseRightClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;

        mouseLeftClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initSearchParams should set initial values', () => {
        const getColorSpy = spyOn<any>(service, 'getColorFromCoord');
        const coord: Vec2 = { x: 0, y: 0 };
        (service as any).initSearchParams(coord);
        expect(service.boundingBox).toBeTruthy();
        expect(drawServiceSpy.getImageData).toHaveBeenCalled();
        expect(getColorSpy).toHaveBeenCalled();
    });

    it('onMouseDown with a button other then left or right should do nothing', () => {
        const initSpy = spyOn<any>(service, 'initSearchParams');
        const wrongEvent = { buttons: 0 } as MouseEvent;
        service.onMouseDown(wrongEvent);
        expect(drawServiceSpy.fillCanvas).not.toHaveBeenCalled();
        expect(initSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown with max tolerence should directly fill canvas', () => {
        service.tolerance = MAX_TOLERANCE;
        service.onMouseDown(mouseRightClick);
        expect(drawServiceSpy.fillCanvas).toHaveBeenCalled();
    });

    it('onMouseDown with right click should do linearSearch', () => {
        const linearSearchSpy = spyOn<any>(service, 'beginLinearSearch');
        service.onMouseDown(mouseRightClick);
        expect(linearSearchSpy).toHaveBeenCalled();
    });

    it('onMouseDown with left click should do bfs', () => {
        const bfsSpy = spyOn<any>(service, 'beginBFS');
        service.onMouseDown(mouseLeftClick);
        expect(bfsSpy).toHaveBeenCalled();
    });

    it('linearSearch should visit all pixels and update canvas', () => {
        const color = new Color(0, 0, 0);
        service.endColor = color;
        service.initialColor = color;
        const getColorSpy = spyOn<any>(service, 'getColorFromIndex');
        getColorSpy.and.callThrough();
        const updateSpy = spyOn<any>(service, 'updateCanvas');
        const canvasSize = 5;
        const pixelsNumber = canvasSize * canvasSize;
        (service as any).beginLinearSearch();
        expect(getColorSpy).toHaveBeenCalledTimes(pixelsNumber);
        expect(updateSpy).toHaveBeenCalled();
    });

    it('linearSearch should not fill pixel if color does not match', () => {
        const isColorSimilarSpy = spyOn<any>(service, 'isColorSimilar');
        isColorSimilarSpy.and.returnValue(false);
        const fillSpy = spyOn<any>(service, 'fillPixel');
        (service as any).beginLinearSearch();
        expect(fillSpy).not.toHaveBeenCalled();
    });

    it('bfs search should work', () => {
        const isValidCoordSpy = spyOn<any>(service, 'isValidCoord');
        isValidCoordSpy.and.returnValue(true);
        const startingCoord = { x: 2, y: 2 };
        const color = new Color(MAX_RGBA_VALUE, MAX_RGBA_VALUE, MAX_RGBA_VALUE);
        service.endColor = color;
        service.initialColor = color;
        // tslint:disable:no-magic-numbers
        // disabling magic number for easy color index acces
        (service as any).fillPixel(48);
        (service as any).fillPixel(0);
        (service as any).fillPixel(24);
        (service as any).fillPixel(44);
        // tslint:enable:no-magic-numbers
        const fillSpy = spyOn<any>(service, 'fillPixel');
        const expectedCalls = 3;
        (service as any).beginBFS(startingCoord);
        expect(fillSpy).toHaveBeenCalledTimes(expectedCalls);
    });

    it('updateCanvas should update the baseCtx', () => {
        service.boundingBox = new BoundingBox();
        service.boundingBox.setStartingCoord({ x: 1, y: 1 });
        (service as any).updateCanvas();
        expect(drawServiceSpy.baseCtx.putImageData).toHaveBeenCalled();
    });

    it('if adjacent coord are valid, should addAdjacentPixel should update visitedPixels and pixels to visit array', () => {
        const shouldAddCoordSpy = spyOn<any>(service, 'shouldAddCoord');
        shouldAddCoordSpy.and.returnValue(true);
        const getIndexFromCoordSpy = spyOn<any>(service, 'getIndexFromCoord');
        getIndexFromCoordSpy.and.returnValue(0);
        service.visitedPixel = [false];
        const startingCoord = { x: 1, y: 1 };
        (service as any).addAdjacentPixel(startingCoord);
        expect(service.visitedPixel[0]).toBeTrue();
        const expectedLength = 4;
        expect(service.pixelToVisit.length).toEqual(expectedLength);
    });

    it('if adjacent coord are valid, should addAdjacentPixel should update visitedPixels and pixels to visit array', () => {
        const shouldAddCoordSpy = spyOn<any>(service, 'shouldAddCoord');
        shouldAddCoordSpy.and.returnValue(false);
        const getIndexFromCoordSpy = spyOn<any>(service, 'getIndexFromCoord');
        getIndexFromCoordSpy.and.returnValue(0);

        service.visitedPixel = [false];
        const startingCoord = { x: 1, y: 1 };
        (service as any).addAdjacentPixel(startingCoord);
        expect(service.visitedPixel[0]).toBeFalse();
        const expectedLength = 0;
        expect(service.pixelToVisit.length).toEqual(expectedLength);
    });

    it('shouldAddCoord should return fasle if coord is not valid', () => {
        const isValidCoordSpy = spyOn<any>(service, 'isValidCoord');
        isValidCoordSpy.and.returnValue(false);

        const wasVisitedSpy = spyOn<any>(service, 'wasCoordVisited');
        wasVisitedSpy.and.returnValue(false);

        const isColorSimilarSpy = spyOn<any>(service, 'isColorSimilar');
        const coord = { x: 1, y: 1 };
        const result = (service as any).shouldAddCoord(coord);
        expect(result).toBeFalse();
        expect(isColorSimilarSpy).not.toHaveBeenCalled();
    });

    it('shouldAddCoord should return fasle if coord was visited', () => {
        const wasVisitedSpy = spyOn<any>(service, 'wasCoordVisited');
        wasVisitedSpy.and.returnValue(true);

        const isValidCoordSpy = spyOn<any>(service, 'isValidCoord');
        isValidCoordSpy.and.returnValue(true);

        const isColorSimilarSpy = spyOn<any>(service, 'isColorSimilar');
        const coord = { x: 1, y: 1 };
        const result = (service as any).shouldAddCoord(coord);
        expect(result).toBeFalse();
        expect(isColorSimilarSpy).not.toHaveBeenCalled();
    });

    it('shouldAddCoord should return isColorSimilar value if coord valid and not visited', () => {
        const wasVisitedSpy = spyOn<any>(service, 'wasCoordVisited');
        wasVisitedSpy.and.returnValue(false);

        const isValidCoordSpy = spyOn<any>(service, 'isValidCoord');
        isValidCoordSpy.and.returnValue(true);

        const isColorSimilarSpy = spyOn<any>(service, 'isColorSimilar');
        const coord = { x: 1, y: 1 };
        (service as any).shouldAddCoord(coord);
        expect(isColorSimilarSpy).toHaveBeenCalled();
    });

    it('fillPixel should modify pixelsData with the endColor', () => {
        // tslint:disable-next-line:no-magic-numbers
        const expectedValues = [25, 120, 60, 255];
        // tslint:disable-next-line:no-magic-numbers
        const color = new Color(25, 120, 60);
        service.endColor = color;
        (service as any).fillPixel(0);
        for (let i = 0; i < PIXEL_INTERVAL; i++) {
            expect(service.pixelsData[i]).toEqual(expectedValues[i]);
        }
    });

    it('getColorFromIndex should return the right color', () => {
        // tslint:disable-next-line:no-magic-numbers
        const expectedValues = [25, 120, 60, 255];
        // tslint:disable-next-line:no-magic-numbers
        const color = new Color(25, 120, 60);
        for (let i = 0; i < PIXEL_INTERVAL; i++) {
            service.pixelsData[i] = expectedValues[i];
        }
        const result: Color = (service as any).getColorFromIndex(0);
        expect(result).toEqual(color);
    });

    it('getColorFromCoord should return the right color', () => {
        // tslint:disable-next-line:no-magic-numbers
        const expectedValues = [25, 120, 60, 255];
        // tslint:disable-next-line:no-magic-numbers
        const color = new Color(25, 120, 60);
        for (let i = 0; i < PIXEL_INTERVAL; i++) {
            service.pixelsData[i] = expectedValues[i];
        }
        const result: Color = (service as any).getColorFromCoord({ x: 0, y: 0 });
        expect(result).toEqual(color);
    });

    it('getIndexFromCoord should do the right conversion', () => {
        const coord: Vec2 = { x: 1, y: 2 };
        const expectedIndex = 44;
        const result = (service as any).getIndexFromCoord(coord);
        expect(result).toEqual(expectedIndex);
    });

    it('getCoordFromIndex should do the right conversion', () => {
        const expectedCoord: Vec2 = { x: 1, y: 2 };
        const index = 44;
        const result = (service as any).getCoordFromIndex(index);
        expect(result).toEqual(expectedCoord);
    });

    it('isValidCoord should use drawingService isCoordValidMethod', () => {
        const coord = { x: 0, y: 0 };
        (service as any).isValidCoord(coord);
        expect(drawServiceSpy.isCoordInCanvas).toHaveBeenCalled();
    });

    it('wasCoordVisited should return the right value', () => {
        const coord: Vec2 = { x: 1, y: 2 };
        const index = 44;
        service.visitedPixel[index] = true;
        const result = (service as any).wasCoordVisited(coord);
        expect(result).toBeTrue();
    });

    // Following test are helped by a CIE94 deltaE (the color difference formula i used) calculator:
    // http://colormine.org/delta-e-calculator/cie94
    // tslint:disable:no-magic-numbers
    // disabling magic number for easy color creation
    it('Almost exact color with min tolerance should return false', () => {
        service.initialColor = new Color(123, 123, 234);
        const testColor = new Color(123, 124, 234);
        service.tolerance = MIN_TOLERANCE;
        const result = (service as any).isColorSimilar(testColor);
        expect(result).toBeFalse();
    });

    it('Almost exact color with very low tolerance should return true', () => {
        service.initialColor = new Color(123, 123, 234);
        const testColor = new Color(123, 124, 234);
        service.tolerance = 1;
        const result = (service as any).isColorSimilar(testColor);
        expect(result).toBeTrue();
    });

    it('Opposite color with max tolerance should return true', () => {
        service.initialColor = new Color(0, 0, 0);
        const testColor = new Color(255, 255, 255);
        service.tolerance = MAX_TOLERANCE;
        const result = (service as any).isColorSimilar(testColor);
        expect(result).toBeTrue();
    });

    it('Opposite color with high tolerance should return false', () => {
        service.initialColor = new Color(0, 0, 0);
        const testColor = new Color(255, 255, 255);
        service.tolerance = 90;
        const result = (service as any).isColorSimilar(testColor);
        expect(result).toBeFalse();
    });

    // DeltaE of next two test should be around 10.25
    it('Based on calculator, this test should return true', () => {
        service.initialColor = new Color(48, 109, 201);
        const testColor = new Color(34, 131, 201);
        service.tolerance = 11;
        const result = (service as any).isColorSimilar(testColor);
        expect(result).toBeTrue();
    });

    it('Based on calculator, this test should return false', () => {
        service.initialColor = new Color(48, 109, 201);
        const testColor = new Color(34, 131, 201);
        service.tolerance = 10;
        const result = (service as any).isColorSimilar(testColor);
        expect(result).toBeFalse();
    });
});