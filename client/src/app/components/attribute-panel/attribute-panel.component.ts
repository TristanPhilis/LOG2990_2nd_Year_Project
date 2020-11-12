import { Component } from '@angular/core';
import { ToolOption } from '@app/classes/tool-option';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, Options, SelectionType, sidebarToolID, Texture, TraceTypes } from '@app/shared/enum';
// tslint:disable:no-any

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    showTools: boolean;
    selectorTypes: ToolOption[];
    tracingTools: ToolOption[];
    shapesTools: ToolOption[];
    tracingTypes: ToolOption[];
    textures: ToolOption[];

    constructor(public toolsService: ToolsService, public drawingService: DrawingService, public selectionService: SelectionService) {
        this.tracingTools = [
            { value: drawingToolId.pencilService, displayName: 'Crayon' },
            { value: drawingToolId.brushService, displayName: 'Pinceau' },
        ];
        this.shapesTools = [
            { value: drawingToolId.rectangleService, displayName: 'Rectangle' },
            { value: drawingToolId.ellipseService, displayName: 'Ellipse' },
            { value: drawingToolId.polygonService, displayName: 'Polygone' },
        ];
        this.selectorTypes = [
            { value: SelectionType.rectangle, displayName: 'Rectangulaire' },
            { value: SelectionType.ellipse, displayName: 'Elliptique' },
            { value: SelectionType.magic, displayName: 'Baguette magique' },
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

    get Options(): typeof Options {
        return Options;
    }

    get toolOptions(): Map<Options, ToolOption> {
        return this.toolsService.currentDrawingToolOptions;
    }

    handleToolChange(selectedTool: drawingToolId): void {
        this.toolsService._currentDrawingTool = Number(selectedTool);
    }

    updateToolOptionValue(key: Options, value: number): void {
        this.toolsService.updateOptionValue(key, value);
    }
}
