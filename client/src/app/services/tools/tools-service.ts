import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush.service';
import { BucketService } from '@app/services/tools/bucket-service';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { LineService } from '@app/services/tools/line-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { PipetteService } from '@app/services/tools/pipette-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { BehaviorSubject } from 'rxjs';
import { EllipseSelectorService } from './ellipse-selector-service';
import { RectangleSelectorService } from './rectangle-selector-service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentDrawingTool: Tool;
    private tools: Tool[];

    private selectedSideBarToolID: sidebarToolID;
    private currentDrawingToolID: drawingToolId;
    toolSidenavToogle: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        pencilService: PencilService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        eraserService: EraserService,
        lineService: LineService,
        brushService: BrushService,
        rectangleSelectionService: RectangleSelectorService,
        ellipseSelectionService: EllipseSelectorService,
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
            ellipseSelectionService,
        ];
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
        this.toolSidenavToogle.next(!this.toolSidenavToogle.getValue());
    }

    openToolSidenav(): void {
        this.toolSidenavToogle.next(true);
    }

    closeToolSidenav(): void {
        this.toolSidenavToogle.next(false);
    }
}
