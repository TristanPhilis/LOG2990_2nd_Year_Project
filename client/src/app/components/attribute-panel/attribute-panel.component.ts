import { Component } from '@angular/core';
import { ToolOptionComponent } from '@app/components/sidebar/tool-option/tool-option.component';
import { BrushService } from '@app/services/tools/brush.service';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { LineService } from '@app/services/tools/line-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, sidebarToolID, Texture, TraceTypes } from '@app/shared/enum';
// tslint:disable:no-any

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    showTools: boolean;
    tracingTools: ToolOptionComponent[];
    shapesTools: ToolOptionComponent[];
    tracingTypes: ToolOptionComponent[];
    textures: ToolOptionComponent[];

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
            { id: drawingToolId.pencilService, name: 'Pencil' },
            { id: drawingToolId.brushService, name: 'Brush' },
        ];
        this.shapesTools = [
            { id: drawingToolId.rectangleService, name: 'Rectangle' },
            { id: drawingToolId.ellipseService, name: 'Ellipse' },
        ];
        this.tracingTypes = [
            { id: TraceTypes.fill, name: 'Fill' },
            { id: TraceTypes.stroke, name: 'Stroke' },
            { id: TraceTypes.fillAndStroke, name: 'Fill and Stroke' },
        ];
        this.textures = [
            { id: Texture.one, name: 'Texture One' },
            { id: Texture.two, name: 'Texture Two' },
            { id: Texture.three, name: 'Texture Three' },
            { id: Texture.four, name: 'Texture Four' },
            { id: Texture.five, name: 'Texture Five' },
        ];
    }

    get sidebarToolID(): typeof sidebarToolID {
        return sidebarToolID;
    }

    get drawingToolId(): typeof drawingToolId {
        return drawingToolId;
    }

    handleChange(selectedTool: drawingToolId): void {
        this.toolsService._currentDrawingTool = Number(selectedTool);
    }

    handleTraceTypeChange(traceType: TraceTypes): void {
        switch (this.toolsService._selectedSideBarToolID) {
            case sidebarToolID.shapes: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.rectangleService: {
                        this.rectangleService._traceType = Number(traceType);
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.ellipseService.traceType = Number(traceType);
                        break;
                    }
                }
                break;
            }
        }
    }

    // need any to acces target.valueAsNumber
    // tslint:disable-next-line:no-any
    sliderChange(size: number): void {
        switch (this.toolsService._selectedSideBarToolID) {
            case sidebarToolID.tracing: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.pencilService: {
                        this.pencilService.size = size;
                        break;
                    }
                    case drawingToolId.brushService: {
                        this.brushService.size = size;
                    }
                }
                break;
            }
            case sidebarToolID.shapes: {
                switch (this.toolsService._currentDrawingToolID) {
                    case drawingToolId.rectangleService: {
                        this.rectangleService.size = size;
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.ellipseService.size = size;
                        break;
                    }
                }
                break;
            }
            case sidebarToolID.line: {
                this.lineService.size = size;
                break;
            }
            case sidebarToolID.eraser: {
                this.eraserService.size = size;
                break;
            }
        }
    }

    handleTextureChange(texture: Texture): void {
        switch (texture) {
            case Texture.one: {
                this.brushService.selectedTexture = Texture.one;
                break;
            }
            case Texture.two: {
                this.brushService.selectedTexture = Texture.two;
                break;
            }
            case Texture.three: {
                this.brushService.selectedTexture = Texture.three;
                break;
            }
            case Texture.four: {
                this.brushService.selectedTexture = Texture.four;
                break;
            }
            case Texture.five: {
                this.brushService.selectedTexture = Texture.five;
                break;
            }
        }
    }
}
