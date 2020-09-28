import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolId } from '@app/shared/enum';
import { PencilService } from './pencil-service';
import { ToolsService } from './tools-service';

describe('ToolsService', () => {
    let service: ToolsService;
    let pencilStub: PencilService;

    beforeEach(() => {
        pencilStub = new PencilService({} as DrawingService);
        TestBed.configureTestingModule({
            providers: [{ provide: PencilService, useValue: pencilStub }],
        });
        service = TestBed.inject(ToolsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('default tool should be the pencil', () => {
        expect(service.currentTool).toEqual(pencilStub);
    });

    // todo: Change with an other tool
    it('Should change the current tool properly', () => {
        service.setCurrentTool(ToolId.pencilService);
        expect(service.currentTool).toEqual(pencilStub);
    });
});
