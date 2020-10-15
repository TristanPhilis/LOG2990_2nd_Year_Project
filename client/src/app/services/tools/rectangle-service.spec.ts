import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { RectangleService } from './rectangle-service';

// tslint:disable:no-any
describe('RectangleService', () => {
    let service: RectangleService;
    let mouseEvent: MouseEvent;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawRectangleSpy: jasmine.Spy<any>;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(RectangleService);
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();

        // Service's Spy configuration
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLClick);
        expect(service.initialCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawRectangle if mouse was already down', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventLClick);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawRectangle if mouse was not already down', () => {
        service.mouseDown = false;
        service.initialCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawRectangle if mouse was already down', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawRectangle if mouse was not already down', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawRectangle if mouse was already down but left button wasnt', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventRClick);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('onKeyDown Should call drawRectangle with shiftDown to true when shift is pressed and mouse is down', () => {
        service.onMouseDown(mouseEventLClick);
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeTrue();
    });

    it('onKeyUp upShould call drawRectangle with shiftDown to false when shift is released and mouse is down', () => {
        service.onMouseDown(mouseEventLClick);
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeFalse();
    });

    it('key event Should not call drawRectangle when mouse is not down', () => {
        service.mouseDown = false;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        service.onKeyUp(keyEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('Pressing an other key shound not do anything', () => {
        const keyEvent = {
            key: 'Alt',
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(service.shiftDown).toBeFalse();
        service.onKeyUp(keyEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });
});
