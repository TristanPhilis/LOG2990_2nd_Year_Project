import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { ToolOption } from '@app/classes/tool-option';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Options } from '@app/shared/enum';
import { EraserService } from './eraser-service';
import { UndoRedoService } from './undoredo-service';

// tslint:disable:no-any
describe('EraserService', () => {
    let service: EraserService;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

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
        service = TestBed.inject(EraserService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();

        // Service spy configuration
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

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

    it('mouseDown with left click should clear the path and push the current coord', () => {
        // tslint:disable-next-line:no-string-literal
        const pushSpy = spyOn<any>(service['pathData'], 'push');
        const clearSpy = spyOn<any>(service, 'clearPath');
        service.onMouseDown(mouseEventLClick);
        expect(pushSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('mouseDown should do nothing if not left click', () => {
        // tslint:disable-next-line:no-string-literal
        const pushSpy = spyOn<any>(service['pathData'], 'push');
        const clearSpy = spyOn<any>(service, 'clearPath');
        service.onMouseDown(mouseEventRClick);
        expect(pushSpy).not.toHaveBeenCalled();
        expect(clearSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should push last coord, call draw and saveAction if mouse was already down', () => {
        service.mouseDown = true;
        // tslint:disable-next-line:no-string-literal
        const pushSpy = spyOn<any>(service['pathData'], 'push');
        service.onMouseUp(mouseEventLClick);
        expect(drawSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).toHaveBeenCalled();
    });

    it('onMouseUp should not call draw if mouse was not already down', () => {
        service.mouseDown = false;
        // tslint:disable-next-line:no-string-literal
        const pushSpy = spyOn<any>(service['pathData'], 'push');
        service.onMouseUp(mouseEventLClick);
        expect(drawSpy).not.toHaveBeenCalled();
        expect(pushSpy).not.toHaveBeenCalled();
        expect(undoRedoServiceSpy.saveAction).not.toHaveBeenCalled();
    });

    it('onMouseMove should draw border and call draw if mouse was already down', () => {
        service.mouseDown = true;
        const drawBorderSpy = spyOn<any>(service, 'drawEraserBorder').and.callThrough();
        service.onMouseMove(mouseEventLClick);

        expect(drawSpy).toHaveBeenCalled();
        expect(drawBorderSpy).toHaveBeenCalled();
    });

    it('onMouseMove should draw border and not call draw if mouse was not already down', () => {
        service.mouseDown = false;
        const drawBorderSpy = spyOn<any>(service, 'drawEraserBorder').and.callThrough();
        service.onMouseMove(mouseEventLClick);

        expect(drawSpy).not.toHaveBeenCalled();
        expect(drawBorderSpy).toHaveBeenCalled();
    });

    it('draw called with missing drawing action property does nothing', () => {
        const options = {
            primaryColor: service.primaryColor,
            toolOptions: new Map<Options, ToolOption>(),
        };
        const action = {
            id: 0,
            options,
        };
        const fillRectSpy = spyOn<any>(baseCtxStub, 'fillRect');
        service.draw(baseCtxStub, action);
        expect(fillRectSpy).not.toHaveBeenCalled();
    });
});
