import { Component } from '@angular/core';
import { ToolOption } from '@app/classes/tool-option';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { DrawingToolId, Font, FontWeight, Options, SelectionType, SidebarToolID, Stamp, TextAlignment, Texture, TraceTypes } from '@app/shared/enum';
// tslint:disable:no-any

@Component({
    selector: 'app-attribute-panel',
    templateUrl: './attribute-panel.component.html',
    styleUrls: ['./attribute-panel.component.scss'],
})
export class AttributePanelComponent {
    selectorTypes: ToolOption[];
    tracingTools: ToolOption[];
    shapesTools: ToolOption[];
    tracingTypes: ToolOption[];
    textures: ToolOption[];
    fonts: ToolOption[];
    fontWeights: ToolOption[];
    textAlignments: ToolOption[];
    stamps: ToolOption[];

    constructor(public toolsService: ToolsService, public drawingService: DrawingService, public selectionService: SelectionService) {
        this.tracingTools = [
            { value: DrawingToolId.pencilService, displayName: 'Crayon' },
            { value: DrawingToolId.brushService, displayName: 'Pinceau' },
            { value: DrawingToolId.featherService, displayName: 'Plume' },
        ];
        this.shapesTools = [
            { value: DrawingToolId.rectangleService, displayName: 'Rectangle' },
            { value: DrawingToolId.ellipseService, displayName: 'Ellipse' },
            { value: DrawingToolId.polygonService, displayName: 'Polygone' },
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
        this.fonts = [
            { value: Font.arial, displayName: 'Arial' },
            { value: Font.verdana, displayName: 'Verdana' },
            { value: Font.newRoman, displayName: 'New Roman' },
            { value: Font.courier, displayName: 'Courier' },
            { value: Font.serif, displayName: 'Serif' },
            { value: Font.comicSans, displayName: 'Comic Sans MS' },
        ];
        this.fontWeights = [
            { value: FontWeight.normal, displayName: 'Normal' },
            { value: FontWeight.bold, displayName: 'Gras' },
            { value: FontWeight.italic, displayName: 'Italique' },
        ];
        this.textAlignments = [
            { value: TextAlignment.left, displayName: 'Gauche' },
            { value: TextAlignment.centre, displayName: 'Centre' },
            { value: TextAlignment.right, displayName: 'Droite' },
        ];
        this.stamps = [
            { value: Stamp.one, displayName: 'Sourire' },
            { value: Stamp.two, displayName: 'Grimace' },
            { value: Stamp.three, displayName: 'Etoile' },
            { value: Stamp.four, displayName: 'Licorne' },
            { value: Stamp.five, displayName: 'Crane' },
        ];
    }

    get SidebarToolID(): typeof SidebarToolID {
        return SidebarToolID;
    }

    get Options(): typeof Options {
        return Options;
    }

    get toolOptions(): Map<Options, ToolOption> {
        return this.toolsService.currentDrawingToolOptions;
    }

    handleToolChange(selectedTool: DrawingToolId): void {
        this.toolsService.setCurrentDrawingTool(Number(selectedTool));
    }

    updateToolOptionValue(key: Options, value: number): void {
        this.toolsService.updateOptionValue(key, value);
    }
}
