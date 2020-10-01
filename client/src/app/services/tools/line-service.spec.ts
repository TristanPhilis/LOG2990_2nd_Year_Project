import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BACKSPACE_KEY, SHIFT_KEY } from '@app/shared/constant';
import { LineService } from './line-service';

// tslint:disable:no-any
describe('LineService', () => {
    let service: LineService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(LineService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseClick should set lineStarted to true on mouse click', () => {
        service.onMouseClick(mouseEvent);
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseClick(mouseEvent);
        expect(service.initialCoord).toEqual(expectedResult);
    });

    it(' onMouseMove should not call drawLine', () => {
        service.lineStarted = false;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine and shiftDown should be true', () => {
        service.lineStarted = true;
        service.shiftDown = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine and shiftDown should be false', () => {
        service.lineStarted = true;
        service.shiftDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onMouseDoubleClick should call drawnLine', () => {
        service.lineStarted = true;
        service.onMouseDoubleClick(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onMouseDoubleClick should not call drawnLine', () => {
        service.lineStarted = false;
        service.onMouseDoubleClick(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('endLine should not draw a line between the first and last point', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.currentCoord = { x: 270, y: 270 };
        service.endLine();
    });

    it('onKeyUp up Should call drawLine with shiftDown to false when shift is released and mouse is click', () => {
        service.lineStarted = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeFalse();
    });
    it('onKeyUp up Should not call drawLine with  shift key not pressed', () => {
        const keyEvent = {
            key: BACKSPACE_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown up Should call drawLine with shiftDown to true when shift is pressed and mouse is click', () => {
        service.lineStarted = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('key event Should not call drawnLine when mouse is not click', () => {
        service.lineStarted = false;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        service.onKeyUp(keyEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('getSnappedCoord should return point coordinate', () => {
        service.initialCoord = { x: 18, y: 0 };
        service.getSnappedCoord();
        service.initialCoord = { x: 0, y: 18 };
        service.getSnappedCoord();
    });
});
