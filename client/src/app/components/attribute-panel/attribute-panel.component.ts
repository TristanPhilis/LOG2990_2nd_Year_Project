import { Component } from '@angular/core';
import { ToolOption } from '@app/classes/tool-option';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, Options, sidebarToolID, Texture, TraceTypes } from '@app/shared/enum';
// tslint:disable:no-any

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    showTools: boolean;
    tracingTools: ToolOption[];
    shapesTools: ToolOption[];
    tracingTypes: ToolOption[];
    textures: ToolOption[];

    constructor(public toolsService: ToolsService, public drawingService: DrawingService) {
        this.tracingTools = [
            { value: drawingToolId.pencilService, displayName: 'Crayon' },
            { value: drawingToolId.brushService, displayName: 'Pinceau' },
        ];
        this.shapesTools = [
            { value: drawingToolId.rectangleService, displayName: 'Rectangle' },
            { value: drawingToolId.ellipseService, displayName: 'Ellipse' },
            { value: drawingToolId.polygonService, displayName: 'Polygone' },
        ];
        this.tracingTypes = [
            { value: TraceTypes.fill, displayName: 'Rempli' },
            { value: TraceTypes.stroke, displayName: 'Contour' },
            { value: TraceTypes.fillAndStroke, displayName: 'Contour et rempli' },
        ];
        this.textures = [
            { value: Texture.one, displayName: 'Texture Une' },
            { value: Texture.two, displayName: 'Texture Deux' },
            { value: Texture.three, displayName: 'Texture Trois' },
            { value: Texture.four, displayName: 'Texture Quatre' },
            { value: Texture.five, displayName: 'Texture Cinq' },
        ];
    }

    get sidebarToolID(): typeof sidebarToolID {
        return sidebarToolID;
    }

    get drawingToolId(): typeof drawingToolId {
        return drawingToolId;
    }

    get Options(): typeof Options {
        return Options;
    }

    get toolOptions(): Map<Options, ToolOption> {
        const optionsMap = this.toolsService.currentDrawingToolOptions;
        return optionsMap ? optionsMap : new Map<Options, ToolOption>();
    }

    handleToolChange(selectedTool: drawingToolId): void {
        this.toolsService._currentDrawingTool = Number(selectedTool);
    }

    updateToolOptionValue(key: Options, value: number): void {
        const option = this.toolOptions.get(key);
        if (option) {
            option.value = Number(value);
            this.toolsService.updateOptionValue(key, option);
        }
    }
}
