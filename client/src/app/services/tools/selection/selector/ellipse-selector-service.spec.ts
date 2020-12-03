import { TestBed } from '@angular/core/testing';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionBox } from '@app/classes/selection-box';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectorService } from './ellipse-selector-service';

// tslint:disable:no-any
describe('EllipseSelectorService', () => {
    let service: EllipseSelectorService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let selectedBox: SelectedBox;
    let selectionBox: SelectionBox;

    beforeEach(() => {
        const contextMethod = ['stroke', 'fill', 'beginPath', 'setLineDash', 'getImageData', 'ellipse'];
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        baseCtxSpy.getImageData.and.returnValue(new ImageData(1, 1));
        selectedBox = new SelectedBox();
        selectionBox = new SelectionBox();
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(EllipseSelectorService);

        // Service's Spy configuration
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxSpy; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawSelectionBox should update the preview canvas', () => {
        service.drawSelectionBox(selectionBox, true);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.stroke).toHaveBeenCalledTimes(2);
        expect(previewCtxSpy.setLineDash).toHaveBeenCalledTimes(2);
    });

    it('copyArea should return a valid SelectionImageData object and call appropriate functions', () => {
        const getClippedImageSpy = spyOn<any>(service, 'getClippedImageData').and.callThrough();
        const getContourImageSpy = spyOn<any>(service, 'getContourImage').and.callThrough();
        const result = service.copyArea(selectedBox);
        expect(getClippedImageSpy).toHaveBeenCalled();
        expect(getContourImageSpy).toHaveBeenCalled();
        expect(result.contours.length).toEqual(1);
        expect(result.imageData).toBeTruthy();
        expect(result.contourImage).toBeTruthy();
    });
});
