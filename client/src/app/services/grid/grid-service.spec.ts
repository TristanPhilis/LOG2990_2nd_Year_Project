import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AnchorsPosition } from '@app/shared/enum';
import { GridService } from './grid-service';

describe('GridService', () => {
    let service: GridService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let gridCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        const contextMethod = ['stroke', 'beginPath', 'moveTo', 'lineTo', 'closePath'];
        gridCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(GridService);

        // tslint:disable:no-string-literal
        service['drawingService'].gridCtx = gridCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        // tslint:enable:no-string-literal
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('when service is destroyed, the subject should be stopped', () => {
        service.ngOnDestroy();
        expect(service.onMagnetismStateChange.isStopped).toBeTrue();
    });

    it('onOptionChange should update grid if it is active', () => {
        service.isShown = true;
        const drawSpy = spyOn(service, 'drawGrid');
        // tslint:disable-next-line:no-any
        const clearSpy = spyOn<any>(service, 'clearGrid');
        service.onOptionChange();
        expect(drawSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('onOptionChange should not update grid if it is not active', () => {
        service.isShown = false;
        const drawSpy = spyOn(service, 'drawGrid');
        // tslint:disable-next-line:no-any
        const clearSpy = spyOn<any>(service, 'clearGrid');
        service.onOptionChange();
        expect(drawSpy).not.toHaveBeenCalled();
        expect(clearSpy).not.toHaveBeenCalled();
    });

    it('toggleGrid should draw the grid if it is now active', () => {
        service.isShown = false;
        const drawSpy = spyOn(service, 'drawGrid');
        service.toggleGrid();
        expect(drawSpy).toHaveBeenCalled();
        expect(service.isShown).toBeTrue();
    });

    it('toggleGrid should clear the grid if it is now inactive', () => {
        service.isShown = true;
        // tslint:disable-next-line:no-any
        const clearSpy = spyOn<any>(service, 'clearGrid');
        service.toggleGrid();
        expect(clearSpy).toHaveBeenCalled();
        expect(service.isShown).toBeFalse();
    });

    it('toggleMagnetism should invert the magnetism activation and call next on the state change subject', () => {
        service.shouldSnapToGrid = false;
        const stateChangeSpy = spyOn(service.onMagnetismStateChange, 'next');
        service.toggleMagnetism();
        expect(stateChangeSpy).toHaveBeenCalled();
        expect(service.shouldSnapToGrid).toBeTrue();
    });

    it('setAnchor shoudl change the current anchor and call next on the magnetism state change subject', () => {
        const stateChangeSpy = spyOn(service.onMagnetismStateChange, 'next');
        service.setAnchor(AnchorsPosition.middleRight);
        expect(stateChangeSpy).toHaveBeenCalled();
        expect(service.currentAnchor).toEqual(AnchorsPosition.middleRight);
    });

    it('drawGrid should update the gridCtx', () => {
        service.drawGrid();
        expect(gridCtxSpy.stroke).toHaveBeenCalled();
    });

    it('clear grid should clear the gridCtx', () => {
        // tslint:disable-next-line:no-any
        (service as any).clearGrid();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(gridCtxSpy);
    });
});
