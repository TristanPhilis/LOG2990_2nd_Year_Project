import { Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { drawingToolId } from '@app/shared/enum';
import { ToolOptionComponent } from './tool-option/tool-option.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    selectedTool: drawingToolId;
    drawingTools: ToolOptionComponent[];
    sideBarTools: ToolOptionComponent[];

    constructor(private toolsService: ToolsService) {
        this.selectedTool = 0;
        this.drawingTools = [
            { id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' },
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }

    showToolDetails(id: drawingToolId): void {
        this.toolsService.setCurrentTool(id);
        this.selectedTool = id;
    }
}
