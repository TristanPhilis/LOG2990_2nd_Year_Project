import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PipetteService } from './pipette-service';

// tslint:disable:no-any
describe('PipetteService', () => {
    let service: PipetteService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorSelServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let ctxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let drawCenterSpy: jasmine.Spy<any>;

    // tslint:disable: no-magic-numbers
    beforeEach(() => {
        colorSelServiceSpy = jasmine.createSpyObj('ColorSelectionService', ['selectNewColor']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['fillCanvas', 'autoSave']);
        ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', [
            'drawImage',
            'arc',
            'save',
            'clip',
            'restore',
            'beginPath',
            'setLineDash',
            'stroke',
        ]);

        const dataArray = new Uint8ClampedArray(3);
        dataArray[0] = 255;
        dataArray[1] = 255;
        dataArray[2] = 255;
        dataArray[3] = 0;
        ctxSpy.getImageData.and.returnValue({
            data: dataArray,
            width: 0,
            height: 0,
        });
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PipetteService);

        // tslint:disable-next-line:no-string-literal
        drawServiceSpy['baseCtx'] = ctxSpy;
        drawServiceSpy.canvas = canvasTestHelper.canvas;

        service.pipettePreviewCtx = previewCtxSpy;

        drawCenterSpy = spyOn<any>(service, 'drawCenter').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do nothing if onMouseDown is triggered with a button other then left or right', () => {
        const positionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 0, y: 0 });
        const wrongEvent = { buttons: 0 } as MouseEvent;
        service.onMouseDown(wrongEvent);
        expect(colorSelServiceSpy.selectNewColor).not.toHaveBeenCalled();
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('should return the right color of the pixel with detectColor()', () => {
        // tslint:disable-next-line:no-magic-numbers
        const blackColor = new Color(255, 255, 255, 0);

        const result: Color = (service as any).detectColor({ x: 0, y: 0 } as Vec2);
        expect(result).toEqual(blackColor);
    });

    it('should have called getPositionFromMouse()', () => {
        const positionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 0, y: 0 });
        const goodEvent = { buttons: 1 } as MouseEvent;
        service.onMouseDown(goodEvent);
        expect(positionSpy).toHaveBeenCalledWith(goodEvent);
    });

    it('should have called getPositionFromMouse() and captureZone() on MouseMove', () => {
        const positionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const captureSpy = spyOn<any>(service, 'captureZone');
        const goodEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 0,
        } as MouseEvent;
        const mouseCoords = { x: goodEvent.offsetX, y: goodEvent.offsetY } as Vec2;

        service.onMouseMove(goodEvent);

        expect(positionSpy).toHaveBeenCalledWith(goodEvent);
        expect(captureSpy).toHaveBeenCalledWith(mouseCoords);
    });

    it('should have callled drawCenter', () => {
        const mouseCoord = { x: 25, y: 25 } as Vec2;
        ctxSpy.getImageData.and.returnValue(new ImageData(1, 1));
        service.captureZone(mouseCoord);

        expect(drawCenterSpy).toHaveBeenCalledWith(previewCtxSpy);
    });
});
