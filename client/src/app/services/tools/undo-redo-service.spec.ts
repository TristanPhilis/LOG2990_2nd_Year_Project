import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { DrawingAction } from '@app/classes/drawing-action';
import { ResizeAction } from '@app/classes/resize-action';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { DrawingToolId, Options } from '@app/shared/enum';
import { Subject } from 'rxjs';

// tslint:disable:no-any
describe('Service: UndoRedo', () => {
    let action: DrawingAction;
    let service: UndoRedoService;

    const newColor = new Color(1, 1, 1, 0);
    const map = new Map<Options, ToolOption>();
    let pencilSpy: jasmine.SpyObj<PencilService>;

    let toolsServiceSpy: jasmine.SpyObj<ToolsService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasSizeServiceSpy: jasmine.SpyObj<CanvasSizeService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['fillCanvas']);
        toolsServiceSpy = jasmine.createSpyObj('toolsService', ['getTool', 'getTools']);
        pencilSpy = jasmine.createSpyObj('pencilService', ['draw']);
        pencilSpy.action = new Subject();
        toolsServiceSpy.getTool.and.returnValue(pencilSpy);
        toolsServiceSpy.getTools.and.returnValue([pencilSpy]);
        canvasSizeServiceSpy = jasmine.createSpyObj('CanvasSizeService', ['completeResize']);
        canvasSizeServiceSpy.action = new Subject();

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ToolsService, useValue: toolsServiceSpy },
                { provide: CanvasSizeService, useValue: canvasSizeServiceSpy },
            ],
        });
        service = TestBed.inject(UndoRedoService);

        action = {
            path: [
                { x: 25, y: 25 },
                { x: 40, y: 40 },
            ],
            id: DrawingToolId.lineService,
            options: { primaryColor: newColor, toolOptions: map },
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onDestroy should unsubscribe', () => {
        expect(canvasSizeServiceSpy.action.observers.length).toEqual(1);
        service.ngOnDestroy();
        expect(canvasSizeServiceSpy.action.observers.length).toEqual(0);
    });

    it('receiving action signal from canvasSizeService should call save action', () => {
        const saveActionSpy = spyOn(service, 'saveAction');
        canvasSizeServiceSpy.action.next({} as ResizeAction);
        expect(saveActionSpy).toHaveBeenCalled();
    });

    it('receiving action signal from a tool should call save action', () => {
        const saveActionSpy = spyOn(service, 'saveAction');
        pencilSpy.action.next({} as DrawingAction);
        expect(saveActionSpy).toHaveBeenCalled();
    });

    it('saveAction if undidAction equal true should empty the redoPile stack', () => {
        service.undidAction = true;
        const pushSPy = spyOn<any>(service.undoPile, 'push');
        service.saveAction(action);
        expect(pushSPy).toHaveBeenCalled();
        expect(service.redoPile).toEqual([]);
    });

    it('if saving a resize action should push the action index in the undoPile stack in the resizeActionIndex array', () => {
        spyOn<any>(service, 'isResizeAction').and.returnValue(true);
        const pushSPy = spyOn<any>(service.resizeActionIndexes, 'push');
        service.saveAction(action);
        expect(pushSPy).toHaveBeenCalled();
    });

    it('undo if lastIn is undefined should do nothing', () => {
        const pushSPy = spyOn<any>(service.redoPile, 'push');
        service.undo();
        expect(pushSPy).not.toHaveBeenCalled();
    });

    it('undo if lastIn is defined should call draw when not a resize action', () => {
        service.undoPile.push(action);
        service.undoPile.push(action);
        service.undo();
        expect(pencilSpy.draw).toHaveBeenCalled();
    });

    it('undo if lastIn is defined should call processResizeAction when last in is a resize action', () => {
        service.undoPile.push(action);
        service.undoPile.push(action);
        const processSpy = spyOn<any>(service, 'processResizeAction');
        spyOn<any>(service, 'isResizeAction').and.returnValue(true);
        service.undo();
        expect(pencilSpy.draw).not.toHaveBeenCalled();
        expect(processSpy).toHaveBeenCalled();
    });

    it('redo if lastIn is undefined should do nothing', () => {
        const pushSPy = spyOn<any>(service.redoPile, 'push');
        service.redo();
        expect(pushSPy).not.toHaveBeenCalled();
    });

    it('redo if lastIn is defined should call draw if it is not a resize action', () => {
        service.redoPile.push(action);
        service.redoPile.push(action);
        service.redo();
        expect(pencilSpy.draw).toHaveBeenCalled();
    });

    it('redo if lastIn is defined should call processResizeAction if it is a resize action', () => {
        service.redoPile.push(action);
        spyOn<any>(service, 'isResizeAction').and.returnValue(true);
        const processSpy = spyOn<any>(service, 'processResizeAction');
        service.redo();
        expect(pencilSpy.draw).not.toHaveBeenCalled();
        expect(processSpy).toHaveBeenCalled();
    });

    it('processResizeAction should call the canvasSize service complete resize fonction', () => {
        const resizeAction = { newSize: {} as Vec2 } as ResizeAction;
        (service as any).processResizeAction(resizeAction, false);
        expect(canvasSizeServiceSpy.completeResize).toHaveBeenCalled();
    });

    it('processResizeAction should use the old size when specified', () => {
        const oldSize = { x: 1, y: 1 };
        const resizeAction = { newSize: {} as Vec2, oldSize } as ResizeAction;
        (service as any).processResizeAction(resizeAction, true);
        expect(canvasSizeServiceSpy.completeResize).toHaveBeenCalledWith(oldSize, resizeAction.imageData);
    });
});
