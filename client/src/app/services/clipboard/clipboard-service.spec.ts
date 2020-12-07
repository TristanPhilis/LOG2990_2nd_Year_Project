import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionAction } from '@app/classes/selection-action';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection-service';
import { DrawingToolId, SelectionType } from '@app/shared/enum';
import { Subject } from 'rxjs';
import { ClipboardService } from './clipboard-service';

// tslint:disable:no-any
describe('ClipBoardService', () => {
    let service: ClipboardService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let copySpy: jasmine.Spy<any>;
    let deleteSpy: jasmine.Spy<any>;
    let actionSpyObj: jasmine.SpyObj<Subject<DrawingAction | SelectionAction>>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'fillCanvasAtLocation']);
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', ['getDrawingAction', 'updateSelectedAreaPreview']);
        TestBed.configureTestingModule({});
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: SelectionService, useValue: selectionServiceSpy },
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

        (service as any).selector.selectedBox = new SelectedBox();
        actionSpyObj = jasmine.createSpyObj('Subject', ['next']);
        (service as any).selector.action = actionSpyObj;
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
        const tempSelectionImageData: SelectionImageData = {};
        (service as any).selector.selectionImageData = tempSelectionImageData;
        (service as any).selector.isAreaSelected = true;
        service.copy();

        expect((service as any).isItemCopied).toEqual(true);
    });

    it('should do nothing when delete is called when no area has been selected', () => {
        (service as any).selector.isAreaSelected = false;

        service.delete();

        expect((service as any).selector.isAreaSelected).toEqual(false);
    });

    it('should delete the imageData when delete is called when an area has been selected', () => {
        const tempSelectionImageData: SelectionImageData = {};
        const tempSelectionAction: SelectionAction = {
            selectorId: SelectionType.ellipse,
            selectedBox: new SelectedBox(),
            selectionImageData: tempSelectionImageData,
            id: DrawingToolId.selectionService,
        };
        selectionServiceSpy.getDrawingAction.and.returnValue(tempSelectionAction);
        (service as any).selector.isAreaSelected = true;
        service.delete();

        expect((service as any).drawingService.clearCanvas).toHaveBeenCalled();
        expect(actionSpyObj.next).toHaveBeenCalled();
    });

    it('should call copy and delete when cut is called when an area has been selected', () => {
        service.cut();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('should not do anything when paste is called when nothing has been copied', () => {
        selectionServiceSpy.isAreaSelected = false;
        service.paste();

        expect(selectionServiceSpy.updateSelectedAreaPreview).not.toHaveBeenCalled();
    });

    it('should paste the copied image on the canvas when paste is called when something has been copied', () => {
        (service as any).selectedBox = new SelectedBox();
        (service as any).copiedSelectionImageData = {};
        (service as any).isItemCopied = true;
        service.paste();

        expect(selectionServiceSpy.updateSelectedAreaPreview).toHaveBeenCalled();
    });
});
