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
import { RectangleSelectorService } from '@app/services/tools/rectangle-selector-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { drawingToolId, Options, sidebarToolID } from '@app/shared/enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentDrawingTool: Tool;
    private tools: Tool[];

    private selectedSideBarToolID: sidebarToolID;
    private currentDrawingToolID: drawingToolId;
    toolSidenavToggle: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        pencilService: PencilService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        eraserService: EraserService,
        lineService: LineService,
        brushService: BrushService,
        rectangleSelectionService: RectangleSelectorService,
        polygonService: PolygonService,
        bucketService: BucketService,
        pipetteService: PipetteService,
    ) {
        this.currentDrawingTool = pencilService;
        this.tools = [
            pencilService,
            rectangleService,
            ellipseService,
            eraserService,
            lineService,
            brushService,
            rectangleSelectionService,
            polygonService,
            bucketService,
            pipetteService,
        ];
    }

    getTool(id: drawingToolId): Tool {
        return this.tools[id];
    }

    set _currentDrawingTool(newToolID: drawingToolId) {
        this.currentDrawingTool = this.tools[newToolID];
        this.currentDrawingToolID = newToolID;
    }

    get _currentDrawingToolID(): drawingToolId {
        return this.currentDrawingToolID;
    }

    set _currentDrawingToolID(id: drawingToolId) {
        this.currentDrawingToolID = id;
    }

    get _selectedSideBarToolID(): sidebarToolID {
        return this.selectedSideBarToolID;
    }

    set _selectedSideBarToolID(id: sidebarToolID) {
        this.selectedSideBarToolID = id;
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

    updateOptionValue(key: Options, option: ToolOption): void {
        this.currentDrawingTool.options.toolOptions.set(key, option);
    }

    get currentDrawingToolOptions(): Map<Options, ToolOption> | undefined {
        if (this.currentDrawingTool.options) {
            return this.currentDrawingTool.options.toolOptions;
        }
        return undefined;
    }
}
