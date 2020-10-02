import { Component } from '@angular/core';
import { ToolOptionComponent } from '@app/components/sidebar/tool-option/tool-option.component';
import { BrushService } from '@app/services/tools/brush.service';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { LineService } from '@app/services/tools/line-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { ToolsService } from '@app/services/tools/tools.service';
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

    constructor(
        public toolsService: ToolsService,
        private pencilService: PencilService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private lineService: LineService,
        private eraserService: EraserService,
        private brushService: BrushService,
    ) {
        this.tracingTools = [
            { id: drawingToolId.pencilService, name: 'Pencil', thickness: 10, color: 'dark' },
            { id: drawingToolId.brushService, name: 'Brush', thickness: 10, color: 'dark' },
        ];
        this.shapesTools = [
            { id: drawingToolId.rectangleService, name: 'Rectangle', thickness: 10, color: 'dark' },
            { id: drawingToolId.ellipseService, name: 'Ellipse', thickness: 10, color: 'dark' },
        ];
    }

    get sidebarToolID(): typeof sidebarToolID {
        return sidebarToolID;
    }

    handleChange(selectedTool: drawingToolId): void {
        this.toolsService._currentDrawingTool = Number(selectedTool);
    }

    sliderChange(event: any): void {
        switch (this.toolsService._selectedSideBarToolID) {
            case sidebarToolID.tracing: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.pencilService: {
                        this.pencilService._thickness = event.target.value;
                        break;
                    }
                    case drawingToolId.brushService: {
                        this.brushService._thickness = event.target.value;
                    }
                }
                break;
            }
            case sidebarToolID.shapes: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.rectangleService: {
                        this.rectangleService._thickness = event.target.value;
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.ellipseService._thickness = event.target.value;
                        break;
                    }
                }
                break;
            }
            case sidebarToolID.line: {
                this.lineService._thickness = event.target.value;
                break;
            }
            case sidebarToolID.eraser: {
                this.eraserService._thickness = event.target.value;
                break;
            }
        }
    }
}
