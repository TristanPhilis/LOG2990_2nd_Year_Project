import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { EllipseService } from './ellipse-service';
import { UndoRedoService } from './undo-redo-service';

// tslint:disable:no-any
describe('EllipseServiceService', () => {
    let service: EllipseService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let mouseEvent: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let mouseEventLClick: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawSpy: jasmine.Spy<any>;
    let setAnchorSpy: jasmine.Spy<any>;
    let updateOpposingCornerSpy: jasmine.Spy<any>;

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
        service = TestBed.inject(EllipseService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();
        setAnchorSpy = spyOn<any>(service.selectionBox, 'setAnchor');
        updateOpposingCornerSpy = spyOn<any>(service.selectionBox, 'updateOpposingCorner');

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

    it(' mouseDown should set the selection box anchor to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLClick);
        expect(setAnchorSpy).toHaveBeenCalledWith(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawEllipse if mouse was already down and saveAction', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(drawSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawEllipse if mouse was not already down', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should update the selectionBox and call drawEllipse if mouse was already down', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventLClick);
        expect(updateOpposingCornerSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawEllipse if mouse was not already down', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawEllipse if mouse was already down but left button wasnt', () => {
        service.mouseDown = true;

        service.onMouseMove(mouseEventRClick);
        expect(drawSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).toHaveBeenCalled();
    });

    it('onKeyDown Should call drawEllipse with shiftDown to true when shift is pressed and mouse is down', () => {
        service.onMouseDown(mouseEventLClick);
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeTrue();
    });

    it('onKeyUp Should call drawEllipse with shiftDown to false when shift is released and mouse is down', () => {
        service.onMouseDown(mouseEventLClick);
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyUp(keyEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBeFalse();
    });

    it('key event Should not call drawEllipse when mouse is not down', () => {
        service.mouseDown = false;
        const keyEvent = {
            key: SHIFT_KEY,
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        service.onKeyUp(keyEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('Pressing an other key shound not do anything', () => {
        const keyEvent = {
            key: 'Alt',
        } as KeyboardEvent;

        service.onKeyDown(keyEvent);
        expect(service.shiftDown).toBeFalse();
        service.onKeyUp(keyEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });
});
