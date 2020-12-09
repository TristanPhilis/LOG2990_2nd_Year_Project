import { TestBed } from '@angular/core/testing';
import { DrawingOptions } from '@app/classes/drawing-options';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { DrawingToolId, Options } from '@app/shared/enum';
import { BrushService } from './brush-service';
import { BucketService } from './bucket-service';
import { EllipseService } from './ellipse-service';
import { EraserService } from './eraser-service';
import { LineService } from './line-service';
import { PencilService } from './pencil-service';
import { PipetteService } from './pipette-service';
import { PolygonService } from './polygon-service';
import { RectangleService } from './rectangle-service';
import { SelectionService } from './selection/selection-service';
import { SprayService } from './spray-service';
import { StampService } from './stamp-service';
import { ToolsService } from './tools-service';

describe('ToolsService', () => {
    let service: ToolsService;
    let toolSpyObj: jasmine.SpyObj<Tool>;

    beforeEach(() => {
        toolSpyObj = jasmine.createSpyObj('Tool', ['onOptionValueChange']);
        TestBed.configureTestingModule({
            providers: [
                { provide: PencilService, useValue: toolSpyObj },
                { provide: RectangleService, useValue: toolSpyObj },
                { provide: EllipseService, useValue: toolSpyObj },
                { provide: EraserService, useValue: toolSpyObj },
                { provide: LineService, useValue: toolSpyObj },
                { provide: BrushService, useValue: toolSpyObj },
                { provide: SelectionService, useValue: toolSpyObj },
                { provide: PolygonService, useValue: toolSpyObj },
                { provide: BucketService, useValue: toolSpyObj },
                { provide: PipetteService, useValue: toolSpyObj },
                { provide: SprayService, useValue: toolSpyObj },
                { provide: StampService, useValue: toolSpyObj },
            ],
        });
        service = TestBed.inject(ToolsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('default tool should be the pencil', () => {
        expect(service.currentDrawingToolID).toEqual(DrawingToolId.pencilService);
    });

    // todo: Change with an other tool
    it('Should change the current tool properly', () => {
        service.setCurrentDrawingTool(DrawingToolId.rectangleService);
        expect(service.currentDrawingToolID).toEqual(DrawingToolId.rectangleService);
    });

    it('getTool should return the specified tool', () => {
        expect(service.getTool(DrawingToolId.pencilService)).toEqual(toolSpyObj);
    });

    it('getTools should return the array of tools', () => {
        // tslint:disable-next-line:no-string-literal
        expect(service.getTools()).toEqual(service['tools']);
    });

    it('openToolSideNav should call next with true', () => {
        const nextSpy = spyOn(service.toolSidenavToggle, 'next');
        service.openToolSidenav();
        expect(nextSpy).toHaveBeenCalledWith(true);
    });

    it('closeToolSidenav should call next with false', () => {
        const nextSpy = spyOn(service.toolSidenavToggle, 'next');
        service.closeToolSidenav();
        expect(nextSpy).toHaveBeenCalledWith(false);
    });

    it('updateOptionValue should call onOptionValueChange when the option exist', () => {
        service.currentDrawingTool.options = {
            toolOptions: new Map<Options, ToolOption>([[Options.size, {} as ToolOption]]),
        } as DrawingOptions;

        service.updateOptionValue(Options.size, 0);
        expect(toolSpyObj.onOptionValueChange).toHaveBeenCalled();
    });

    it('updateOptionValue should not call onOptionValueChange when the option exist', () => {
        service.updateOptionValue(Options.size, 0);
        expect(toolSpyObj.onOptionValueChange).not.toHaveBeenCalled();
    });
});
