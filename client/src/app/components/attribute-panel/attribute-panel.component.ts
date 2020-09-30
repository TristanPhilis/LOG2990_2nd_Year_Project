import { Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { drawingToolId } from '@app/shared/enum';
import { ToolOptionComponent } from '../sidebar/tool-option/tool-option.component';

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    public showTools: boolean;

    public drawingTools: ToolOptionComponent[];

    constructor(public toolsService: ToolsService) {
        this.drawingTools = [
            { id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' },
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }
}
