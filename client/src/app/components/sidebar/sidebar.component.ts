import { Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { ToolId } from '@app/shared/enum';
import { ToolOptionComponent } from './tool-option/tool-option.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    selectedTool: ToolId;
    tools: ToolOptionComponent[];
    constructor(private toolsService: ToolsService) {
        this.selectedTool = 0;
        this.tools = [
            { id: ToolId.pencilService, thickness: 10, color: 'dark' },
            { id: ToolId.rectangleService, thickness: 10, color: 'dark' },
            { id: ToolId.ellipseService, thickness: 10, color: 'dark' },
            { id: ToolId.lineService, thickness: 10, color: 'dark' },
            { id: ToolId.eraserService, thickness: 10, color: 'dark' },
            { id: ToolId.brushService, thickness: 10, color: 'dark' },
        ];
    }

    showToolDetails(toolId: ToolId): void {
        this.toolsService.setCurrentTool(toolId);
        this.selectedTool = toolId;
    }
}
