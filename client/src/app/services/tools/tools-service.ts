import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { BrushService } from '@app/services/tools/brush.service';
import { BucketService } from '@app/services/tools/bucket-service';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { LineService } from '@app/services/tools/line-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { PipetteService } from '@app/services/tools/pipette-service';
import { PolygonService } from '@app/services/tools/polygon-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { SelectionService } from '@app/services/tools/selection/selection-service';
import { DrawingToolId, Options, SidebarToolID } from '@app/shared/enum';
import { BehaviorSubject } from 'rxjs';
import { StampService } from './stamp-service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentDrawingTool: Tool;
    private tools: Tool[];

    selectedSideBarToolID: SidebarToolID;
    currentDrawingToolID: DrawingToolId;
    toolSidenavToggle: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        pencilService: PencilService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        eraserService: EraserService,
        lineService: LineService,
        brushService: BrushService,
        selectionService: SelectionService,
        polygonService: PolygonService,
        bucketService: BucketService,
        pipetteService: PipetteService,
        stampService: StampService,
    ) {
        this.currentDrawingTool = pencilService;
        this.tools = [
            pencilService,
            rectangleService,
            ellipseService,
            eraserService,
            lineService,
            brushService,
            selectionService,
            polygonService,
            bucketService,
            pipetteService,
            stampService,
        ];
    }

    getTool(id: DrawingToolId): Tool {
        return this.tools[id];
    }

    getTools(): Tool[] {
        return this.tools;
    }

    setCurrentDrawingTool(newToolID: DrawingToolId): void {
        this.currentDrawingTool = this.tools[newToolID];
        this.currentDrawingToolID = newToolID;
    }

    toggleToolSidenav(): void {
        this.toolSidenavToggle.next(!this.toolSidenavToggle.getValue());
    }

    openToolSidenav(): void {
        this.toolSidenavToggle.next(true);
    }

    closeToolSidenav(): void {
        this.toolSidenavToggle.next(false);
    }

    updateOptionValue(key: Options, value: number): void {
        const option = this.currentDrawingToolOptions.get(key);
        if (option) {
            option.value = Number(value);
            this.currentDrawingTool.options.toolOptions.set(key, option);
            this.currentDrawingTool.onOptionValueChange();
        }
    }

    get currentDrawingToolOptions(): Map<Options, ToolOption> {
        const options = this.currentDrawingTool.options;
        return options ? options.toolOptions : new Map<Options, ToolOption>();
    }
}
