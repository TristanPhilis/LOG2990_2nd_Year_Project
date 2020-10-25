import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BACKSPACE_KEY, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';
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

        // Spy Service configuration
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

    it(' onMouseClick should set lineStarted to true on first click', () => {
        service.onMouseClick(mouseEvent);
        const expectedResult: Vec2 = { x: 25, y: 25 };
        expect(service.initialCoord).toEqual(expectedResult);
    });

    it(' onMouseClick should push new coord when line is started', () => {
        service.lineStarted = true;
        service.onMouseClick(mouseEvent);
        const expectPathDatalenght = 1;
        expect(service['pathData'].length).toEqual(expectPathDatalenght);
    });

    it(' onMouseMove should not call drawLine if line not started', () => {
        service.lineStarted = false;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine when line started and shift pressed', () => {
        service.lineStarted = true;
        service.shiftDown = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine when line started and shift not pressed', () => {
        service.lineStarted = true;
        service.shiftDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onMouseDoubleClick should call drawnLine and endLine', () => {
        const endLineSpy = spyOn<any>(service, 'endLine').and.callThrough();
        service.lineStarted = true;
        service.onMouseDoubleClick(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(endLineSpy).toHaveBeenCalled();
    });

    it('onMouseDoubleClick should not call drawnLine if line not started', () => {
        service.lineStarted = false;
        service.onMouseDoubleClick(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('endLine should not draw a line between the first and last point if farther then 20xp', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.currentCoord = { x: 270, y: 270 };
        const ctxStrokeSpy = spyOn<any>(service['drawingService'].baseCtx, 'stroke').and.callThrough();
        service.endLine();
        expect(ctxStrokeSpy).not.toHaveBeenCalled();
    });

    it('endLine should draw a line between the first and last point if closer then 20xp', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.currentCoord = { x: 15, y: 15 };
        const ctxStrokeSpy = spyOn<any>(service['drawingService'].baseCtx, 'stroke').and.callThrough();
        service.endLine();
        expect(ctxStrokeSpy).toHaveBeenCalled();
    });

    it('onKeyUp should call drawLine when shift is released and line is started', () => {
        service.lineStarted = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeFalse();
    });

    it('onKeyUp Should not call drawLine with other key then shift released', () => {
        const keyEvent = {
            key: BACKSPACE_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call drawLine with shiftDown to true when shift is pressed and line is started', () => {
        service.lineStarted = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call drawLine when shiftDown is already true', () => {
        service.lineStarted = true;
        service.shiftDown = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
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

    it('calculateAngle should return the right angle', () => {
        const firstPoint = { x: 0, y: 0 };
        const secondPoint = { x: 1, y: 1 };
        const expectedAngle = MIDDLE_SNAP_ANGLE;
        expect(service.calculateAngle(firstPoint, secondPoint)).toEqual(expectedAngle);
    });

    it('getAdjustedCoord should call getSnappedCoord when shift is pressed', () => {
        const getSnappedCoordSpy = spyOn(service, 'getSnappedCoord');
        service.shiftDown = true;
        service.getAdjustedCoord();
        expect(getSnappedCoordSpy).toHaveBeenCalled();
    });

    it('getAdjustedCoord should not call getSnappedCoord when shift is not pressed', () => {
        const getSnappedCoordSpy = spyOn(service, 'getSnappedCoord');
        service.shiftDown = false;
        service.getAdjustedCoord();
        expect(getSnappedCoordSpy).not.toHaveBeenCalled();
    });

    it('getSnappedCoord should return the snapped point coordinate', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.currentCoord = { x: 2, y: 0.1 };
        let expectedPoint = { x: 2, y: 0 };
        expect(service.getSnappedCoord()).toEqual(expectedPoint);

        service.initialCoord = { x: 0, y: 0 };
        service.currentCoord = { x: 0.1, y: 2 };
        expectedPoint = { x: 0, y: 2 };
        expect(service.getSnappedCoord()).toEqual(expectedPoint);

        service.initialCoord = { x: 0, y: 0 };
        service.currentCoord = { x: 2, y: 2.1 };
        expectedPoint = { x: 2, y: 2 };
        const result = service.getSnappedCoord();
        expect(result.x).toEqual(expectedPoint.x);
        expect(result.y).toBeCloseTo(expectedPoint.y, 1);
    });

    it('getSnappedCoord should use last path point when not empty', () => {
        service['pathData'].push({ x: 1, y: 1 });
        service.currentCoord = { x: 2, y: 1.1 };
        const expectedPoint = { x: 2, y: 1 };
        expect(service.getSnappedCoord()).toEqual(expectedPoint);
    });

    it('OnKeyDown with backspace should remove a point from pathData, and call drawLine if line started', () => {
        const initialLenght = 3;
        for (let i = 0; i < initialLenght; i++) {
            service['pathData'].push({ x: i, y: i });
        }
        const event = {
            key: BACKSPACE_KEY,
        } as KeyboardEvent;

        service.onKeyDown(event);
        expect(service['pathData'].length).toEqual(initialLenght - 1);
        expect(drawLineSpy).not.toHaveBeenCalled();
        service.lineStarted = true;
        service.onKeyDown(event);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(initialLenght - 2);
    });

    it('OnKeyDown with escape should remove all point from pathData and reset coord', () => {
        const initialLenght = 3;
        for (let i = 0; i < initialLenght; i++) {
            service['pathData'].push({ x: i, y: i });
        }
        const event = {
            key: ESCAPE_KEY,
        } as KeyboardEvent;

        service.onKeyDown(event);
        expect(service['pathData'].length).toEqual(0);
        const resetCoord = { x: 0, y: 0 };
        expect(service.initialCoord).toEqual(resetCoord);
        expect(service.currentCoord).toEqual(resetCoord);
    });
});
