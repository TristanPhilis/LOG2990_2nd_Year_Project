import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TraceTypes } from '@app/shared/enum';
import { MAX_SIDES, MIN_SIDES, PolygonService } from './polygon-service';

// tslint:disable:no-any
describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let drawSpy: jasmine.Spy<any>;

    beforeEach(() => {
        const contextMethod = ['stroke', 'fill', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'setLineDash', 'arc'];
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
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
        expect(service.nSides).toEqual(MIN_SIDES);
        expect(service.traceType).toEqual(TraceTypes.stroke);
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

    it('onMouseUp with mouseDown should call draw', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('onMouseMove without mouseDown should do nothing', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEventLClick);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove with leftClick down should draw on preview canvas', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventLClick);
        expect(drawSpy).toHaveBeenCalledWith(previewCtxSpy);
    });

    it('onMouseMove without leftClick down should draw on base canvas', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventRClick);
        expect(drawSpy).toHaveBeenCalledWith(baseCtxSpy);
        expect(service.mouseDown).toBeFalse();
    });

    it('getCornerPosition should return the right number of coordinates', () => {
        service.nSides = MIN_SIDES;
        let result: Vec2[] = (service as any).getCornersPosition();
        expect(result.length).toEqual(MIN_SIDES);
        service.nSides = MAX_SIDES;
        result = (service as any).getCornersPosition();
        expect(result.length).toEqual(MAX_SIDES);
    });

    it('fill should call good fonction based on fill traceType', () => {
        service.traceType = TraceTypes.fill;
        (service as any).fill(baseCtxSpy);
        expect(baseCtxSpy.fill).toHaveBeenCalledTimes(1);
        expect(baseCtxSpy.stroke).not.toHaveBeenCalled();
    });

    it('fill should call good fonction based on fill and stroke traceType', () => {
        service.traceType = TraceTypes.fillAndStroke;
        (service as any).fill(baseCtxSpy);
        expect(baseCtxSpy.fill).toHaveBeenCalledTimes(1);
        expect(baseCtxSpy.stroke).toHaveBeenCalledTimes(1);
    });

    it('fill should call good fonction based on stroke traceType', () => {
        service.traceType = TraceTypes.stroke;
        (service as any).fill(baseCtxSpy);
        expect(baseCtxSpy.fill).not.toHaveBeenCalled();
        expect(baseCtxSpy.stroke).toHaveBeenCalledTimes(1);
    });
});
