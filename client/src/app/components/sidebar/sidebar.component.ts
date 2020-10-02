import { Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { SidebarToolComponent } from './sidebar-tool/sidebar-tool.component';
import { ToolOptionComponent } from './tool-option/tool-option.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    public selectedTool: drawingToolId;
    public drawingTools: ToolOptionComponent[];
    public sideBarTools: SidebarToolComponent[];

    public showDrawingTools: boolean;

    constructor(private toolsService: ToolsService) {
        this.selectedTool = 0;
        this.showDrawingTools = false;

        this.sideBarTools = [
            { id: sidebarToolID.move, name: 'Select & Move' },
            { id: sidebarToolID.cropping, name: 'Crop' },
            { id: sidebarToolID.drawing, name: 'Drawing' },
            { id: sidebarToolID.text, name: 'Text' },
            { id: sidebarToolID.filling, name: 'Fill' },
        ];

        this.drawingTools = [
            { id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' },
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }

    chooseTool(id: sidebarToolID): void {
        if (id === sidebarToolID.drawing) {
            if (!this.showDrawingTools) {
                this.showDrawingTools = true;
            } else {
                this.showDrawingTools = false;
            }
        } else {
            this.showDrawingTools = false;
        }
    }

    showToolDetails(id: drawingToolId): void {
        this.toolsService.setCurrentTool(id);
        this.selectedTool = id;
    }
}
