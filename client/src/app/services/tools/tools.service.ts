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
    public _currentDrawingTool: Tool;
    private tools: Tool[];

    private _selectedSideBarToolID: sidebarToolID;
    private _currentDrawingToolID: drawingToolId;

    constructor(pencilService: PencilService, rectangleService: RectangleService, ellipseService: EllipseService, eraserService: EraserService) {
        this._currentDrawingTool = pencilService;
        this.tools = [pencilService, rectangleService, ellipseService, eraserService];
    }

    set currentDrawingTool(newToolID: drawingToolId) {
        this._currentDrawingTool = this.tools[newToolID];
        this.currentDrawingToolID = newToolID;
    }

    get currentDrawingToolID(): drawingToolId {
        return this._currentDrawingToolID;
    }

    set currentDrawingToolID(id: drawingToolId) {
        this._currentDrawingToolID = id;
    }

    get selectedSideBarToolID(): sidebarToolID {
        return this._selectedSideBarToolID;
    }

    set selectedSideBarToolID(id: sidebarToolID) {
        this._selectedSideBarToolID = id;
    }
}
