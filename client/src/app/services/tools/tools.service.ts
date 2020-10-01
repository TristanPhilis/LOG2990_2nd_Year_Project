import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentDrawingTool: Tool;
    private tools: Tool[];

    private selectedSideBarToolID: sidebarToolID;
    private currentDrawingToolID: drawingToolId;

    constructor(pencilService: PencilService, rectangleService: RectangleService, ellipseService: EllipseService, eraserService: EraserService) {
        this.currentDrawingTool = pencilService;
        this.tools = [pencilService, rectangleService, ellipseService, eraserService];
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
}
