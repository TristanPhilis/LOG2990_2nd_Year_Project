import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { PencilService } from '@app/services/tools/pencil-service';
import { ToolId } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {

    //@ViewChild
    currentTool: Tool;
    private tools: Tool[];
    constructor(pencilService: PencilService) {
        this.currentTool = pencilService;
        this.tools = [pencilService];
    }

    setCurrentTool(toolId: ToolId): void {
        this.currentTool = this.tools[toolId];
    }
}
