import { TestBed } from '@angular/core/testing';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { drawingToolId } from '@app/shared/enum';
import { PencilService } from './pencil-service';
import { ToolsService } from './tools-service';

describe('ToolsService', () => {
    let service: ToolsService;
    let pencilStub: PencilService;

    beforeEach(() => {
        pencilStub = new PencilService({} as DrawingService, {} as ColorSelectionService);
        TestBed.configureTestingModule({
            providers: [{ provide: PencilService, useValue: pencilStub }],
        });
        service = TestBed.inject(ToolsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('default tool should be the pencil', () => {
        expect(service.currentDrawingTool).toEqual(pencilStub);
    });

    // todo: Change with an other tool
    it('Should change the current tool properly', () => {
        service._currentDrawingTool = drawingToolId.pencilService;
        expect(service.currentDrawingTool).toEqual(pencilStub);
    });

    it('Should change the current tool properly', () => {
        service._currentDrawingToolID = drawingToolId.pencilService;
        expect(service.currentDrawingTool).toEqual(pencilStub);
    });
});
