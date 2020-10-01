import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { drawingToolId } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentTool: Tool;
    private tools: Tool[];
<<<<<<< HEAD

    private _selectedTool: drawingToolId;
    private _showDrawingTools: boolean;

    constructor(pencilService: PencilService, rectangleService: RectangleService, ellipseService: EllipseService) {
=======
    constructor(pencilService: PencilService, rectangleService: RectangleService, ellipseService: EllipseService, eraserService: EraserService) {
>>>>>>> EntryPoint
        this.currentTool = pencilService;
        this.tools = [pencilService, rectangleService, ellipseService, eraserService];
    }

    setCurrentTool(toolId: drawingToolId): void {
        this.currentTool = this.tools[toolId];
    }

    get showDrawingTools(): boolean {
        return this._showDrawingTools;
    }

    set showDrawingTools(value: boolean) {
        this._showDrawingTools = value;
    }

    showToolDetails(id: drawingToolId): void {
        console.log('Changing Tool');
        this.setCurrentTool(id);
        this._selectedTool = id;
    }

    get selectedTool(): drawingToolId {
        return this._selectedTool;
    }

    set selectedTool(tool: drawingToolId) {
        this._selectedTool = tool;
    }
}
