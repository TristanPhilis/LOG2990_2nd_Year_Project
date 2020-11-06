import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Options, TraceTypes } from '@app/shared/enum';
import { MAX_SIDES, MIN_SIDES, PolygonService } from './polygon-service';
import { UndoRedoService } from './undo-redo-service';

// tslint:disable:no-any
describe('PolygonService', () => {
    let service: PolygonService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let drawSpy: jasmine.Spy<any>;

    beforeEach(() => {
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['saveAction']);
        const defaultColor = new Color(0, 0, 0);
        colorServiceSpy = jasmine.createSpyObj('colorServiceSpy', ['']);
        colorServiceSpy.primaryColor = defaultColor;
        colorServiceSpy.secondaryColor = defaultColor;
        const contextMethod = ['stroke', 'fill', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'setLineDash', 'arc'];
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                { provide: ColorSelectionService, useValue: colorServiceSpy },
            ],
        });
        service = TestBed.inject(PolygonService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        // tslint:enable:no-string-literal

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

    it('should start with default values ', () => {
        expect(service.selectionBox).toBeTruthy();
        expect(service.options.toolOptions.get(Options.numberOfSides)?.value).toEqual(MIN_SIDES);
        expect(service.options.toolOptions.get(Options.traceType)?.value).toEqual(TraceTypes.fill);
        expect(service.options.toolOptions.get(Options.size)?.value).toEqual(1);
    });

    it('onMouseDown should do nothing if not left click', () => {
        const setAnchorSpy = spyOn<any>(service.selectionBox, 'setAnchor');
        service.onMouseDown(mouseEventRClick);
        expect(setAnchorSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown with lewft click should set the anchor choord of selection box', () => {
        const setAnchorSpy = spyOn<any>(service.selectionBox, 'setAnchor');
        service.onMouseDown(mouseEventLClick);
        expect(setAnchorSpy).toHaveBeenCalled();
    });

    it('onMouseUp if mouseDown is false should do nothing', () => {
        service.onMouseUp(mouseEventLClick);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp with mouseDown should update the selection box and call draw and saveAction', () => {
        const updateOpposingCornerSpy = spyOn<any>(service.selectionBox, 'updateOpposingCorner');
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(updateOpposingCornerSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('onMouseMove without mouseDown should do nothing', () => {
        const updateOpposingCornerSpy = spyOn<any>(service.selectionBox, 'updateOpposingCorner');
        service.mouseDown = false;
        service.onMouseMove(mouseEventLClick);
        expect(drawSpy).not.toHaveBeenCalled();
        expect(updateOpposingCornerSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove with leftClick down should update selection box and draw it', () => {
        const updateOpposingCornerSpy = spyOn<any>(service.selectionBox, 'updateOpposingCorner');
        const drawSelectionBoxSpy = spyOn<any>(service, 'drawSelectionBox').and.callThrough();
        service.mouseDown = true;
        service.onMouseMove(mouseEventLClick);
        expect(drawSpy).toHaveBeenCalled();
        expect(updateOpposingCornerSpy).toHaveBeenCalled();
        expect(drawSelectionBoxSpy).toHaveBeenCalled();
    });

    it('onMouseMove without leftClick down should draw on base canvas and save action', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventRClick);
        expect(drawSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('getCornerPosition should return the right number of coordinates', () => {
        let result: Vec2[] = (service as any).getCornersPosition(service.selectionBox, MIN_SIDES);
        expect(result.length).toEqual(MIN_SIDES);
        result = (service as any).getCornersPosition(service.selectionBox, MAX_SIDES);
        expect(result.length).toEqual(MAX_SIDES);
    });

    it('fill should call good fonction based on fill traceType', () => {
        (service as any).fill(baseCtxSpy, TraceTypes.fill, service.primaryColor, service.secondaryColor);
        expect(baseCtxSpy.fill).toHaveBeenCalledTimes(1);
        expect(baseCtxSpy.stroke).not.toHaveBeenCalled();
    });

    it('fill should call good fonction based on fill and stroke traceType', () => {
        (service as any).fill(baseCtxSpy, TraceTypes.fillAndStroke, service.primaryColor, service.secondaryColor);
        expect(baseCtxSpy.fill).toHaveBeenCalledTimes(1);
        expect(baseCtxSpy.stroke).toHaveBeenCalledTimes(1);
    });

    it('fill should call good fonction based on stroke traceType', () => {
        (service as any).fill(baseCtxSpy, TraceTypes.stroke, service.primaryColor, service.secondaryColor);
        expect(baseCtxSpy.fill).not.toHaveBeenCalled();
        expect(baseCtxSpy.stroke).toHaveBeenCalledTimes(1);
    });
});
