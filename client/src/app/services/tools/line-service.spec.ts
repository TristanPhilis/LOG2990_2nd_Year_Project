import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BACKSPACE_KEY, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';
import { LineService } from './line-service';
import { UndoRedoService } from './undo-redo-service';

// tslint:disable:no-any
describe('LineService', () => {
    let service: LineService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let mouseEvent: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawSpy: jasmine.Spy<any>;

    beforeEach(() => {
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['saveAction']);
        const defaultColor = new Color(0, 0, 0);
        colorServiceSpy = jasmine.createSpyObj('colorServiceSpy', ['']);
        colorServiceSpy.primaryColor = defaultColor;
        colorServiceSpy.secondaryColor = defaultColor;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                { provide: ColorSelectionService, useValue: colorServiceSpy },
            ],
        });
        service = TestBed.inject(LineService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();

        // Spy Service configuration
        // tslint:disable-next-line:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        // tslint:disable-next-line:no-string-literal
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

    it(' onMouseClick should set lineStarted to true on first click and initialise pathData with starting point and end point', () => {
        service.onMouseClick(mouseEvent);

        // tslint:disable-next-line:no-string-literal
        expect(service['lineStarted']).toBeTrue();
        // tslint:disable-next-line:no-string-literal
        expect(service['pathData'].length).toEqual(2);
    });

    it(' onMouseClick should push new coord when line is started', () => {
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = true;
        // tslint:disable-next-line:no-string-literal
        const pushSpy = spyOn<any>(service['pathData'], 'push');
        service.onMouseClick(mouseEvent);
        expect(pushSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if line not started', () => {
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = false;
        service.onMouseMove(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine when line started', () => {
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = true;
        service.onMouseMove(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('onMouseDoubleClick should call drawnLine, endLine and saveAction when lineStarted is true', () => {
        const endLineSpy = spyOn<any>(service, 'endLine').and.callThrough();
        // tslint:disable:no-string-literal
        service['lineStarted'] = true;
        service['pathData'].push({ x: 0, y: 0 });
        service['pathData'].push({ x: 0, y: 0 });
        // tslint:enable:no-string-literal
        service.onMouseDoubleClick(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(endLineSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).toHaveBeenCalled();
    });

    it('onMouseDoubleClick should not call drawnLine if line not started', () => {
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = false;
        service.onMouseDoubleClick(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    // tslint:disable:no-string-literal
    it('endLine should not draw a line between the first and last point if farther then 20xp', () => {
        service['pathData'].push({ x: 0, y: 0 });
        const farAwayCoord = 270;
        service['pathData'].push({ x: farAwayCoord, y: farAwayCoord });
        service['pathData'].push({ x: farAwayCoord, y: farAwayCoord });
        const spliceSpy = spyOn<any>(service['pathData'], 'splice');
        service.endLine();
        expect(spliceSpy).not.toHaveBeenCalled();
    });

    it('endLine should draw a line between the first and last point if closer then 20xp', () => {
        service['pathData'].push({ x: 0, y: 0 });
        const closeCoord = 5;
        service['pathData'].push({ x: closeCoord, y: closeCoord });
        service['pathData'].push({ x: closeCoord, y: closeCoord });
        const spliceSpy = spyOn<any>(service['pathData'], 'splice');
        service.endLine();
        expect(spliceSpy).toHaveBeenCalled();
    });

    it('onKeyUp should update lastCoord and call drawLine when shift is released and line is started', () => {
        service['lineStarted'] = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;
        const updateLastCoordSpy = spyOn(service, 'updateLastCoord');
        service['pathData'].push({ x: 0, y: 0 });
        service['pathData'].push({ x: 0, y: 0 });
        service.onKeyUp(keyEvent);
        expect(updateLastCoordSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeFalse();
    });

    it('onKeyDown should call drawLine with shiftDown to true when shift is pressed and line is started', () => {
        service['lineStarted'] = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;
        const coord = { x: 0, y: 0 };
        service['pathData'].push(coord);
        service['pathData'].push(coord);
        service.currentCoord = coord;
        service.onKeyDown(keyEvent);
        expect(drawSpy).toHaveBeenCalled();
    });
    // tslint:enable:no-string-literal

    it('onKeyDown should not call drawLine when shiftDown is already true', () => {
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = true;
        service.shiftDown = true;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp Should not call drawLine with other key then shift released', () => {
        const keyEvent = {
            key: BACKSPACE_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('key event Should not call drawnLine when line is not started', () => {
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = false;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        service.onKeyUp(keyEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('calculateAngle should return the right angle', () => {
        const firstPoint = { x: 0, y: 0 };
        const secondPoint = { x: 1, y: 1 };
        const expectedAngle = MIDDLE_SNAP_ANGLE;
        expect(service.calculateAngle(firstPoint, secondPoint)).toEqual(expectedAngle);
    });

    it('getAdjustedCoord should call getSnappedCoord when shift is pressed', () => {
        const firstPoint = { x: 0, y: 0 };
        const secondPoint = { x: 1, y: 1 };
        const getSnappedCoordSpy = spyOn(service, 'getSnappedCoord');
        service.shiftDown = true;
        service.getAdjustedCoord(firstPoint, secondPoint);
        expect(getSnappedCoordSpy).toHaveBeenCalled();
    });

    it('getAdjustedCoord should not call getSnappedCoord when shift is not pressed', () => {
        const firstPoint = { x: 0, y: 0 };
        const secondPoint = { x: 1, y: 1 };
        const getSnappedCoordSpy = spyOn(service, 'getSnappedCoord');
        service.shiftDown = false;
        const result = service.getAdjustedCoord(firstPoint, secondPoint);
        expect(getSnappedCoordSpy).not.toHaveBeenCalled();
        expect(result).toEqual(secondPoint);
    });

    it('getSnappedCoord should return the snapped point coordinate', () => {
        let initialCoord = { x: 0, y: 0 };
        let currentCoord = { x: 2, y: 0.1 };
        let expectedPoint = { x: 2, y: 0 };
        expect(service.getSnappedCoord(initialCoord, currentCoord)).toEqual(expectedPoint);

        initialCoord = { x: 0, y: 0 };
        currentCoord = { x: 0.1, y: 2 };
        expectedPoint = { x: 0, y: 2 };
        expect(service.getSnappedCoord(initialCoord, currentCoord)).toEqual(expectedPoint);

        initialCoord = { x: 0, y: 0 };
        currentCoord = { x: 2, y: 2.1 };
        expectedPoint = { x: 2, y: 2 };
        const result = service.getSnappedCoord(initialCoord, currentCoord);
        expect(result.x).toEqual(expectedPoint.x);
        expect(result.y).toBeCloseTo(expectedPoint.y, 1);
    });

    it('OnKeyDown with backspace should remove a point from pathData, and call drawLine if line started', () => {
        const initialLenght = 3;
        for (let i = 0; i < initialLenght; i++) {
            // tslint:disable-next-line:no-string-literal
            service['pathData'].push({ x: i, y: i });
        }
        const event = {
            key: BACKSPACE_KEY,
        } as KeyboardEvent;

        service.onKeyDown(event);
        expect(drawSpy).not.toHaveBeenCalled();
        // tslint:disable-next-line:no-string-literal
        service['lineStarted'] = true;
        service.onKeyDown(event);
        expect(drawSpy).toHaveBeenCalled();
        // tslint:disable-next-line:no-string-literal
        expect(service['pathData'].length).toEqual(initialLenght - 1);
    });

    it('OnKeyDown with escape should remove all point from pathData and reset coord', () => {
        const initialLenght = 3;
        for (let i = 0; i < initialLenght; i++) {
            // tslint:disable-next-line:no-string-literal
            service['pathData'].push({ x: i, y: i });
        }
        const event = {
            key: ESCAPE_KEY,
        } as KeyboardEvent;

        service.onKeyDown(event);
        // tslint:disable-next-line:no-string-literal
        expect(service['pathData'].length).toEqual(0);
    });
});
