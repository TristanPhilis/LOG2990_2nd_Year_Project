import { Component } from '@angular/core';
import { ToolOptionComponent } from '@app/components/sidebar/tool-option/tool-option.component';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    showTools: boolean;
    tracingTools: ToolOptionComponent[];
    shapesTools: ToolOptionComponent[];

    constructor(public toolsService: ToolsService) {
        this.tracingTools = [{ id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' }];
        this.shapesTools = [
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }

    get sidebarToolID(): typeof sidebarToolID {
        return sidebarToolID;
    }

    handleChange(selectedTool: drawingToolId): void {
        this.toolsService._currentDrawingTool = selectedTool;
    }

    // need any to acces target.valueAsNumber
    // tslint:disable-next-line:no-any
    sliderChange(event: any): void {
        switch (this.toolsService._selectedSideBarToolID) {
            case sidebarToolID.tracing: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.pencilService: {
                        this.tracingTools[0].thickness = event.target.value;
                        break;
                    }
                }
                break;
            }
            case sidebarToolID.shapes: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.rectangleService: {
                        this.shapesTools[0].thickness = event.target.value;
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.shapesTools[1].thickness = event.target.value;
                        break;
                    }
                }
                break;
            }
        }

        console.log(this.tracingTools[0].thickness);
    }
}
