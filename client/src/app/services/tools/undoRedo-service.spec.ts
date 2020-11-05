import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { DrawingAction } from '@app/classes/drawing-action';
import { ToolOption } from '@app/classes/tool-option';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { UndoRedoService } from '@app/services/tools/undoredo-service';
import { drawingToolId, Options } from '@app/shared/enum';

// tslint:disable:no-any
fdescribe('Service: UndoRedo', () => {
    let action: DrawingAction;
    let service: UndoRedoService;
    const newColor = new Color(1, 1, 1, 0);
    const map = new Map<Options, ToolOption>();
    let pencilSpy: jasmine.SpyObj<PencilService>;

    let toolsServiceSpy: jasmine.SpyObj<ToolsService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['fillCanvas']);
        toolsServiceSpy = jasmine.createSpyObj('toolsService', ['getTool']);
        pencilSpy = jasmine.createSpyObj('pencilService', ['draw']);
        toolsServiceSpy.getTool.and.returnValue(pencilSpy);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(UndoRedoService);
        service.toolsService = toolsServiceSpy;

        action = {
            path: [
                { x: 25, y: 25 },
                { x: 40, y: 40 },
            ],
            id: drawingToolId.lineService,
            options: { primaryColor: newColor, toolOptions: map },
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
        service.undoPile.push(action);
        service.undoPile.push(action);
        service.undo();
        expect(pencilSpy.draw).toHaveBeenCalled();
    });

    it('redo if lastIn is undefined should do nothing', () => {
        const pushSPy = spyOn<any>(service.redoPile, 'push');
        service.redo();
        expect(pushSPy).not.toHaveBeenCalled();
    });
    it('redo if lastIn is defined should call draw', () => {
        service.redoPile.push(action);
        service.redoPile.push(action);
        service.redo();
        expect(pencilSpy.draw).toHaveBeenCalled();
    });
});
