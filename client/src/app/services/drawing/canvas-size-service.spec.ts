import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid-service';
import { AnchorsPosition } from '@app/shared/enum';
import { Subject } from 'rxjs';
import { CanvasSizeService } from './canvas-size-service';
import { DrawingService } from './drawing.service';

describe('ResizingService', () => {
    let service: CanvasSizeService;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['drawGrid']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['fillCanvas', 'setImageData', 'autoSave', 'getImageData']);
        drawingServiceSpy.onLoadingImage = new Subject<Vec2>();
        TestBed.configureTestingModule({
            providers: [
                { provide: GridService, useValue: gridServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        });
        service = TestBed.inject(CanvasSizeService);

        // tslint:disable:no-string-literal setting up drawing Service
        service['drawingService'].canvas = canvasTestHelper.drawCanvas;
        service['drawingService'].previewCanvas = canvasTestHelper.drawCanvas;
        service['drawingService'].selectionCanvas = canvasTestHelper.selectionCanvas;
        service['drawingService'].gridCanvas = canvasTestHelper.drawCanvas;

        service.rightAnchor = document.createElement('div');
        service.bottomAnchor = document.createElement('div');
        service.cornerAnchor = document.createElement('div');
    });

    afterEach(() => {
        canvasTestHelper.resetSize();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // tslint:disable:no-any
    it('resizeCanvas should update the size of the specified canvas', () => {
        const width = 150;
        const height = 200;
        (service as any).resizeCanvas(drawingServiceSpy.canvas, width, height);
        expect(drawingServiceSpy.canvas.width).toEqual(width);
        expect(drawingServiceSpy.canvas.height).toEqual(height);
    });

    it('resizeMainCanvas should update the canvasSize attribute and resize the 3 similar sized canvas', () => {
        const updateAnchorsPositionSpy = spyOn<any>(service, 'updateAnchorsPosition');
        const width = 150;
        const height = 200;
        const resizeCanvasSpy = spyOn<any>(service, 'resizeCanvas');
        (service as any).resizeMainCanvas(width, height);
        expect(resizeCanvasSpy).toHaveBeenCalledWith(drawingServiceSpy.canvas, width, height);
        expect(resizeCanvasSpy).toHaveBeenCalledWith(drawingServiceSpy.gridCanvas, width, height);
        expect(resizeCanvasSpy).toHaveBeenCalledWith(drawingServiceSpy.previewCanvas, width, height);
        expect(updateAnchorsPositionSpy).toHaveBeenCalled();
    });

    it('getValidCanvasSize should make sure width and height are minimum 250 when lower', () => {
        const smallerSize = 100;
        const expectedSize = 250;
        const result = (service as any).getValidCanvasSize(smallerSize, smallerSize);
        expect(result.x).toEqual(expectedSize);
        expect(result.y).toEqual(expectedSize);
    });

    it('getValidCanvasSize should return the same width and height when higher then 250', () => {
        const biggerSize = 300;
        const result = (service as any).getValidCanvasSize(biggerSize, biggerSize);
        expect(result.x).toEqual(biggerSize);
        expect(result.y).toEqual(biggerSize);
    });

    it('updateAnchorsPosition should update the three anchors position', () => {
        const size = 400;
        (service as any).updateAnchorsPosition({ x: size, y: size });
        expect(service.bottomAnchor.style.top).toEqual('403px');
        expect(service.bottomAnchor.style.left).toEqual('203px');
        expect(service.cornerAnchor.style.top).toEqual('403px');
        expect(service.cornerAnchor.style.left).toEqual('403px');
        expect(service.rightAnchor.style.left).toEqual('403px');
        expect(service.rightAnchor.style.top).toEqual('203px');
    });

    it('restoreInitialSize should resize the main canvas with the initial size', () => {
        const initialSize = 550;
        service['initialCanvasSize'] = { x: initialSize, y: initialSize };
        const resizeMainCanvasSpy = spyOn<any>(service, 'resizeMainCanvas');
        service.restoreInitialSize();
        expect(resizeMainCanvasSpy).toHaveBeenCalledWith(initialSize, initialSize);
    });

    it('updatePreviewSize should keep the same x coord if resizeX is false', () => {
        const size = 300;
        const newSize = 400;
        const mouseEvent = { offsetX: newSize, offsetY: newSize } as MouseEvent;
        service.previewSize = { x: size, y: size };
        service['resizeX'] = false;
        service['resizeY'] = true;
        (service as any).updatePreviewSize(mouseEvent);
        expect(service.previewSize.x).toEqual(size);
        expect(service.previewSize.y).toEqual(newSize);
    });

    it('updatePreviewSize should keep the same y coord if resizeY is false', () => {
        const size = 300;
        const newSize = 400;
        const mouseEvent = { offsetX: newSize, offsetY: newSize } as MouseEvent;
        service.previewSize = { x: size, y: size };
        service['resizeX'] = true;
        service['resizeY'] = false;
        (service as any).updatePreviewSize(mouseEvent);
        expect(service.previewSize.y).toEqual(size);
        expect(service.previewSize.x).toEqual(newSize);
    });

    it('completeResize should call setImageData and drawGrid if grid is active', () => {
        gridServiceSpy.isShown = true;
        const imageData = new ImageData(1, 1);
        service.completeResize({ x: 1, y: 1 }, imageData);
        expect(gridServiceSpy.drawGrid).toHaveBeenCalled();
        expect(drawingServiceSpy.setImageData).toHaveBeenCalledWith(imageData);
    });

    it('completeResize should call setImageData and not drawGrid if grid is not active', () => {
        gridServiceSpy.isShown = false;
        const imageData = new ImageData(1, 1);
        service.completeResize({ x: 1, y: 1 }, imageData);
        expect(gridServiceSpy.drawGrid).not.toHaveBeenCalled();
        expect(drawingServiceSpy.setImageData).toHaveBeenCalledWith(imageData);
    });

    it('onMouseUp should update the preview size one last time, complete the resize action and emit the action next event', () => {
        const updatePreviewSizeSpy = spyOn<any>(service, 'updatePreviewSize');
        const completeResizeSpy = spyOn<any>(service, 'completeResize');
        const nextSpy = spyOn(service.action, 'next');
        service.onMouseUp({} as MouseEvent);
        expect(updatePreviewSizeSpy).toHaveBeenCalled();
        expect(completeResizeSpy).toHaveBeenCalled();
        expect(nextSpy).toHaveBeenCalled();
    });

    it('onMouseMove should update the preview size and anchors position', () => {
        const updatePreviewSizeSpy = spyOn<any>(service, 'updatePreviewSize');
        const updateAnchorsPositionSpy = spyOn<any>(service, 'updateAnchorsPosition');
        service.onMouseMove({} as MouseEvent);
        expect(updatePreviewSizeSpy).toHaveBeenCalled();
        expect(updateAnchorsPositionSpy).toHaveBeenCalled();
    });

    it('initializeResizing should set properly resizeY and resizeX', () => {
        service.initializeResizing(AnchorsPosition.middleBottom);
        expect(service['resizeX']).toBeFalse();
        expect(service['resizeY']).toBeTrue();
        service.initializeResizing(AnchorsPosition.middleRight);
        expect(service['resizeX']).toBeTrue();
        expect(service['resizeY']).toBeFalse();
        service.initializeResizing(AnchorsPosition.bottomRight);
        expect(service['resizeX']).toBeTrue();
        expect(service['resizeY']).toBeTrue();
    });

    it('setInitialCanvasSize should set the 3 main canvas to half the workzone size and the selection canvas to the workzone size', () => {
        const workZoneWidth = 1000;
        const workZoneHeight = 800;
        service.setInitialCanvasSize(workZoneWidth, workZoneHeight);
        expect(drawingServiceSpy.canvas.width).toEqual(workZoneWidth / 2);
        expect(drawingServiceSpy.canvas.height).toEqual(workZoneHeight / 2);
        expect(drawingServiceSpy.previewCanvas.width).toEqual(workZoneWidth / 2);
        expect(drawingServiceSpy.previewCanvas.height).toEqual(workZoneHeight / 2);
        expect(drawingServiceSpy.gridCanvas.width).toEqual(workZoneWidth / 2);
        expect(drawingServiceSpy.gridCanvas.height).toEqual(workZoneHeight / 2);
        expect(drawingServiceSpy.selectionCanvas.width).toEqual(workZoneWidth);
        expect(drawingServiceSpy.selectionCanvas.height).toEqual(workZoneHeight);
    });

    it('when receiving onLoading event, should call resizeMainCanvas', () => {
        const resizeMainCanvasSpy = spyOn<any>(service, 'resizeMainCanvas');
        drawingServiceSpy.onLoadingImage.next({ x: 0, y: 0 });
        expect(resizeMainCanvasSpy).toHaveBeenCalled();
    });

    it('onDestroy should unsubscribe', () => {
        expect(drawingServiceSpy.onLoadingImage.observers.length).toEqual(1);
        service.ngOnDestroy();
        expect(drawingServiceSpy.onLoadingImage.observers.length).toEqual(0);
    });
});
