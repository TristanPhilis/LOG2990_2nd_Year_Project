import { Component, ViewChild } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { drawingToolId } from '@app/shared/enum';
import { ToolOptionComponent } from '../sidebar/tool-option/tool-option.component';

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    @ViewChild('toolSelect') select: any;

    public showTools: boolean;
    public drawingTools: ToolOptionComponent[];
    public selectedTool: drawingToolId;

    constructor(public toolsService: ToolsService) {
        this.drawingTools = [
            { id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' },
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }

    public handleChange(): void {
        this.selectedTool = this.select.nativeElement.value;
        // this.toolsService.showToolDetails(this.selectedTool);
        console.log(this.selectedTool);
    }
}
