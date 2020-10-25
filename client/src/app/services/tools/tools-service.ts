import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { BrushService } from '@app/services/tools/brush.service';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { LineService } from '@app/services/tools/line-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentDrawingTool: Tool;
    private tools: Tool[];

    private selectedSideBarToolID: sidebarToolID;
    private currentDrawingToolID: drawingToolId;
    public toolSidenavToogle: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        pencilService: PencilService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        eraserService: EraserService,
        lineService: LineService,
        brushService: BrushService,
    ) {
        this.currentDrawingTool = pencilService;
        this.tools = [pencilService, rectangleService, ellipseService, eraserService, lineService, brushService];
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
