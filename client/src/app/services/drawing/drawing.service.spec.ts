import { TestBed } from '@angular/core/testing';
import { BoundingBox } from '@app/classes/bounding-box';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { Subject } from 'rxjs';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        const size = 100;
        service.canvas = canvasTestHelper.canvas;
        service.canvas.width = size;
        service.canvas.height = size;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.onLoadingImage = new Subject<Vec2>();
    });

    afterEach(() => {
        canvasTestHelper.canvas.getContext('2d')?.clearRect(0, 0, canvasTestHelper.canvas.width, canvasTestHelper.canvas.height);
        canvasTestHelper.drawCanvas.getContext('2d')?.clearRect(0, 0, canvasTestHelper.canvas.width, canvasTestHelper.canvas.height);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('getDataUrl should return the url', () => {
        const url = service.getImageURL();
        expect(url).toBeTruthy();
    });

    it('Background should be white', () => {
        service.clearCanvas(service.baseCtx);
        service.fillCanvas('white');
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const white = 0xffffffff;
        const hasColoredPixels = pixelBuffer.some((color) => color !== white);
        expect(hasColoredPixels).toEqual(false);
    });

    it('Should set and get correct imageData', () => {
        const width = service.canvas.width;
        const height = service.canvas.height;
        const imageData = service.baseCtx.createImageData(width, height);
        const maxAlpha = 255;
        const singlePixelDataSize = 4;
        for (let i = 0; i < imageData.data.length; i += singlePixelDataSize) {
            imageData.data[i + 0] = 1;
            imageData.data[i + 1] = 1;
            imageData.data[i + 2] = 1;
            imageData.data[i + singlePixelDataSize - 1] = maxAlpha;
        }
        service.setImageData(imageData);
        expect(service.getImageData()).toEqual(imageData);
    });

    it('isCoordInCanvas should return true for valid coord', () => {
        const insideCoord = 50;
        const result = service.isCoordInCanvas({ x: insideCoord, y: insideCoord });
        expect(result).toBeTrue();
    });

    it('isCoordInCanvas should return false for invalid coord', () => {
        const outsideCoord = 200;
        const result = service.isCoordInCanvas({ x: outsideCoord, y: outsideCoord });
        expect(result).toBeFalse();
    });

    it('should autosave the canvas', () => {
        service.autoSave();
        expect(localStorage.getItem(service.lastDrawingKey)).toEqual(service.getImageURL());
    });

    it('should send savedDrawing', () => {
        service.sendDrawing('');
        expect(service.drawingToLoad).toEqual('');
    });

    it('fillCanvas at location should call fillrect with the right position', () => {
        const width = 150;
        const height = 200;
        const box = new BoundingBox();
        box.right = width;
        box.bottom = height;
        const clearRectSpy = spyOn(service.baseCtx, 'fillRect');
        service.fillCanvasAtLocation('white', box);
        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, width, height);
    });
});
