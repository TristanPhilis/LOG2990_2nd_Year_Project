import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { PencilService } from '@app/services/tools/pencil-service';
import { ToolId } from '@app/shared/enum';
import { RectangleService } from './rectangle-service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentTool: Tool;
    private tools: Tool[];
    constructor(pencilService: PencilService, rectangleService: RectangleService) {
        this.currentTool = pencilService;
        this.tools = [pencilService, rectangleService];
    }

    setCurrentTool(toolId: ToolId): void {
        this.currentTool = this.tools[toolId];
    }
}
