import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectedBox } from '@app/classes/selected-box';
import { CanvasManipulationService } from './canvas-manipulation-service';

describe('CanvasManipulationService', () => {
    let service: CanvasManipulationService;
    let rendererCreateSpy: jasmine.Spy;
    let ctxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasManipulationService);
        // tslint:disable-next-line:no-string-literal
        rendererCreateSpy = spyOn(service['renderer'], 'createElement');
        rendererCreateSpy.and.returnValue(canvasTestHelper.canvas);
        const ctxMethods = ['translate', 'rotate', 'scale'];
        ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ctxMethods);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getImageFromImageData should create a new canvas as the image source', () => {
        service.getImageFromImageData(new ImageData(1, 1));
        expect(rendererCreateSpy).toHaveBeenCalled();
    });

    it('createCanvas should return a new canvas with the specified with and height', () => {
        const size = 45;
        const result = service.createCanvas(size, size);
        expect(rendererCreateSpy).toHaveBeenCalled();
        expect(result.width).toEqual(size);
        expect(result.height).toEqual(size);
    });

    it('applyRotation should translate to the center, do the rotation, and translate back', () => {
        const angle = 0;
        const center = { x: 0, y: 0 };
        service.applyRotation(ctxSpy, angle, center);
        expect(ctxSpy.translate).toHaveBeenCalledTimes(2);
        expect(ctxSpy.rotate).toHaveBeenCalled();
    });

    it('if right side is left of left side, should call scale with -1 for the x value', () => {
        const box = new SelectedBox();
        box.left = 2;
        box.right = 1;
        box.top = 0;
        box.bottom = 2;
        service.applyMirrorScaling(ctxSpy, box);
        const expectedXscaleFactor = -1;
        expect(ctxSpy.scale).toHaveBeenCalledWith(expectedXscaleFactor, 1);
    });

    it('if bottom side is higher  then top side, should call scale with -1 for the y value', () => {
        const box = new SelectedBox();
        box.left = 1;
        box.right = 2;
        box.top = 2;
        box.bottom = 0;
        service.applyMirrorScaling(ctxSpy, box);
        const expectedYscaleFactor = -1;
        expect(ctxSpy.scale).toHaveBeenCalledWith(1, expectedYscaleFactor);
    });
});
