import { Component } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { ToolOptionComponent } from '../sidebar/tool-option/tool-option.component';

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    public showTools: boolean;
    public tracingTools: ToolOptionComponent[];
    public shapesTools: ToolOptionComponent[];

    constructor(public toolsService: ToolsService) {
        this.tracingTools = [{ id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' }];
        this.shapesTools = [
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }

    public get sidebarToolID(): typeof sidebarToolID {
        return sidebarToolID;
    }

    public handleChange(selectedTool: drawingToolId): void {
        this.toolsService.currentDrawingTool = selectedTool;
    }

    public sliderChange(event: any): void {
        switch (this.toolsService.selectedSideBarToolID) {
            case sidebarToolID.tracing: {
                switch (this.toolsService.currentDrawingToolID) {
                    case drawingToolId.pencilService: {
                        this.tracingTools[0].thickness = event.target.value;
                        break;
                    }
                }
                break;
            }
            case sidebarToolID.shapes: {
                switch (this.toolsService.currentDrawingToolID) {
                    case drawingToolId.rectangleService: {
                        this.shapesTools[0].thickness = event.target.value;
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.shapesTools[1].thickness = event.taraget.value;
                        break;
                    }
                }
                break;
            }
        }

        console.log(this.tracingTools[0].thickness);
    }
}
