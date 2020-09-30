import { Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { SidebarToolComponent } from './sidebar-tool/sidebar-tool.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    public sideBarTools: SidebarToolComponent[];

    public showDrawingTools: boolean;

    constructor(public toolsService: ToolsService) {
        toolsService.selectedTool = 0;
        toolsService.showDrawingTools = false;

        this.sideBarTools = [
            { id: sidebarToolID.move, name: 'Select & Move' },
            { id: sidebarToolID.cropping, name: 'Crop' },
            { id: sidebarToolID.drawing, name: 'Drawing' },
            { id: sidebarToolID.text, name: 'Text' },
            { id: sidebarToolID.filling, name: 'Fill' },
        ];
    }

    chooseTool(id: sidebarToolID): void {
        if (id === sidebarToolID.drawing) {
            if (!this.toolsService.showDrawingTools) {
                this.toolsService.showDrawingTools = true;
            } else {
                this.toolsService.showDrawingTools = false;
            }
        } else {
            this.toolsService.showDrawingTools = false;
        }
    }

    showToolDetails(id: drawingToolId): void {
        this.toolsService.setCurrentTool(id);
        this.toolsService.selectedTool = id;
    }
}
