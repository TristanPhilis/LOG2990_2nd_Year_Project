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
<<<<<<< HEAD
    public sideBarToolsTop: SidebarToolComponent[];
    public sideBarToolsBottom: SidebarToolComponent[];

    public showDrawingTools: boolean;

    constructor(public toolsService: ToolsService) {
        toolsService.selectedTool = 0;
        toolsService.showDrawingTools = false;

        this.sideBarToolsTop = [
            { id: sidebarToolID.move, name: 'Select & Move' },
            { id: sidebarToolID.cropping, name: 'Crop' },
            { id: sidebarToolID.drawing, name: 'Drawing' },
            { id: sidebarToolID.text, name: 'Text' },
            { id: sidebarToolID.filling, name: 'Fill' },
=======
    selectedTool: ToolId;
    tools: ToolOptionComponent[];
    constructor(private toolsService: ToolsService) {
        this.selectedTool = 0;
        this.tools = [
            { id: ToolId.pencilService, thickness: 10, color: 'dark' },
            { id: ToolId.rectangleService, thickness: 10, color: 'dark' },
            { id: ToolId.ellipseService, thickness: 10, color: 'dark' },
            { id: ToolId.eraserService, thickness: 10, color: 'dark' },
>>>>>>> EntryPoint
        ];
        this.sideBarToolsBottom = [
            { id: sidebarToolID.createNew, name: 'New Drawing' },
            { id: sidebarToolID.saveCurrent, name: 'Save Drawing' },
            { id: sidebarToolID.openCarrousel, name: 'Open Carrousel' },
            { id: sidebarToolID.exportCurrent, name: 'Export Drawing' },
            { id: sidebarToolID.openGuide, name: 'Open Guide' },
        ];
    }

    onButtonPress(id: sidebarToolID): void {
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
