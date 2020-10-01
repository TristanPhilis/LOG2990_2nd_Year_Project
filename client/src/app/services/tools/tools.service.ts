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
    currentTool: Tool;
    private tools: Tool[];

    private _selectedSideBarTool: sidebarToolID;
    private _showTracingTools: boolean;
    private _showShapesTools: boolean;

    constructor(pencilService: PencilService, rectangleService: RectangleService, ellipseService: EllipseService, eraserService: EraserService) {
        this.currentTool = pencilService;
        this.tools = [pencilService, rectangleService, ellipseService, eraserService];
    }

    setCurrentTool(toolId: drawingToolId): void {
        this.currentTool = this.tools[toolId];
    }

    get showTracingTools(): boolean {
        return this._showTracingTools;
    }

    set showTracingTools(value: boolean) {
        this._showTracingTools = value;
    }

    get showShapesTools(): boolean {
        return this._showShapesTools;
    }

    set showShapesTools(value: boolean) {
        this._showShapesTools = value;
    }

    get selectedSideBarTool(): sidebarToolID {
        return this._selectedSideBarTool;
    }

    set selectedSideBarTool(tool: sidebarToolID) {
        this._selectedSideBarTool = tool;
    }
}
