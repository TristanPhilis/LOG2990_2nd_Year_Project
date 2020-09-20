import { AfterViewInit, Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { ToolId } from '@app/shared/enum';
import { ToolOptionComponent } from './tool-option/tool-option.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
    selectedTool: ToolId;
    tools: ToolOptionComponent[];
    constructor(private toolsService: ToolsService) {
        this.tools = [
            { thickness: 10, color: 'dark' },
            { thickness: 10, color: 'dark' },
        ];
    }

    ngAfterViewInit() {}

    showToolDetails(toolId: ToolId): void {
        this.toolsService.setCurrentTool(toolId);
        this.selectedTool = toolId;
    }
}
