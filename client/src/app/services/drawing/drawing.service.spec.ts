import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
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
        service.fillWhiteBackground();
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
});
