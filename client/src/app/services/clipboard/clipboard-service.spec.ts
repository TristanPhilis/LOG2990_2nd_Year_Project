import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { ClipboardService } from './clipboard-service';

// tslint:disable:no-any
describe('ClipBoardService', () => {
    let service: ClipboardService;
    let mouseEventLClick: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let copySpy: jasmine.Spy<any>;
    let deleteSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'fillCanvasAtLocation']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['saveAction']);
        TestBed.configureTestingModule({});
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });
        service = TestBed.inject(ClipboardService);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        copySpy = spyOn<any>(service, 'copy').and.callThrough();
        deleteSpy = spyOn<any>(service, 'delete').and.callThrough();
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].selectionCtx = selectionCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do nothing when copy is called when no area has been selected', () => {
        (service as any).selector.isAreaSelected = false;

        service.copy();

        expect((service as any).isItemCopied).toEqual(false);
    });

    it('should copy the imageData when copy is called when an area has been selected', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 50,
            buttons: 1,
        } as MouseEvent;
        (service as any).selector.onMouseDown(mouseEventLClick);
        (service as any).selector.onMouseMove(mouseEvent);
        (service as any).selector.onMouseUp(mouseEvent);
        service.copy();

        expect((service as any).isItemCopied).toEqual(true);
    });

    it('should not call copy and delete when cut is called when an area has been selected', () => {
        service.cut();

        expect((service as any).isItemCopied).toEqual(false);
    });

    it('should call copy and delete when cut is called when an area has been selected', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 50,
            buttons: 1,
        } as MouseEvent;
        (service as any).selector.onMouseDown(mouseEventLClick);
        (service as any).selector.onMouseMove(mouseEvent);
        (service as any).selector.onMouseUp(mouseEvent);
        service.cut();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('should not do anything when paste is called when nothing has been copied', () => {
        service.paste();

        expect((service as any).selector.isAreaSelected).toEqual(false);
    });

    it('should paste the copied image on the canvas when paste is called when something has been copied', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 50,
            buttons: 1,
        } as MouseEvent;
        (service as any).selector.onMouseDown(mouseEventLClick);
        (service as any).selector.onMouseMove(mouseEvent);
        (service as any).selector.onMouseUp(mouseEvent);
        service.copy();
        service.paste();

        expect((service as any).selector.isAreaSelected).toEqual(true);
    });
});
