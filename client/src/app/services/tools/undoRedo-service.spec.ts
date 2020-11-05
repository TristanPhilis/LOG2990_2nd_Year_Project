import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { DrawingAction } from '@app/classes/drawing-action';
import { drawingToolId } from '@app/shared/enum';
import { DrawingService } from '../drawing/drawing.service';
import { UndoRedoService } from './undoredo-service';

// tslint:disable:no-any
fdescribe('Service: UndoRedo', () => {
    let action: DrawingAction;
    let service: UndoRedoService;
    const blackColor = new Color(255, 255, 255, 0);

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    // let drawSpy: jasmine.Spy<any>;

    beforeEach(() => {
        const contextMethod = ['stroke', 'fill', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'setLineDash', 'arc'];
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['fillCanvas', 'clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(UndoRedoService);

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        // tslint:enable:no-string-literal

        action = {
            path: [
                { x: 25, y: 25 },
                { x: 40, y: 40 },
            ],
            id: drawingToolId.lineService,
            options: { primaryColor: blackColor, toolOptions },
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('saveAction if undiAction equal true should set redoPile at undefined', () => {
        service.undidAction = true;
        const pushSPy = spyOn<any>(service.undoPile, 'push');
        service.saveAction(action);
        expect(pushSPy).toHaveBeenCalled();
        expect(service.redoPile).toEqual([]);
    });

    it('undiAction should equal false ', () => {
        service.undidAction = false;
        const pushSPy = spyOn<any>(service.undoPile, 'push');
        service.saveAction(action);
        expect(pushSPy).toHaveBeenCalled();
    });

    it('undo if lastIn is undefined should do nothing', () => {
        const pushSPy = spyOn<any>(service.redoPile, 'push');
        service.undo();
        expect(pushSPy).not.toHaveBeenCalled();
    });

    it('undo if lastIn is defined should call draw', () => {
        service.undoPile[service.undoPile.length] = action;
        service.undo();
        expect(service.undoPile).not.toEqual([]);
    });
});
