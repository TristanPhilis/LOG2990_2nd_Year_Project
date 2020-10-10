import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { EllipseService } from './ellipse-service';

// tslint:disable:no-any
describe('EllipseServiceService', () => {
    let service: EllipseService;
    let mouseEvent: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let mouseEventLClick: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawEllipseSpy: jasmine.Spy<any>;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(EllipseService);
        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.callThrough();

        // Spy service configuration
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

    it(' mouseDown should set initial to correct position', () => {
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

    it(' onMouseUp should call drawEllipse if mouse was already down', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventLClick);
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawEllipse if mouse was not already down', () => {
        service.mouseDown = false;
        service.initialCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawEllipse if mouse was already down', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseMove(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawEllipse if mouse was not already down', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawEllipse if mouse was already down but left button wasnt', () => {
        service.initialCoord = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventRClick);
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it('onKeyDown Should call drawEllipse with shiftDown to true when shift is pressed and mouse is down', () => {
        service.onMouseDown(mouseEventLClick);
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeTrue();
    });

    it('onKeyUp Should call drawEllipse with shiftDown to false when shift is released and mouse is down', () => {
        service.onMouseDown(mouseEventLClick);
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeFalse();
    });

    it('key event Should not call drawEllipse when mouse is not down', () => {
        service.mouseDown = false;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        service.onKeyUp(keyEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it('Pressing an other key shound not do anything', () => {
        const keyEvent = {
            key: 'Alt',
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(service.shiftDown).toBeFalse();
        service.onKeyUp(keyEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });
});
