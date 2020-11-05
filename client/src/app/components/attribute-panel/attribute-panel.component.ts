import { Component } from '@angular/core';
import { ToolOption } from '@app/classes/tool-option';
import { BrushService } from '@app/services/tools/brush.service';
import { RectangleSelectorService } from '@app/services/tools/rectangle-selector-service';
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
    selectionTools: ToolOption[];
    tracingTools: ToolOption[];
    shapesTools: ToolOption[];
    tracingTypes: ToolOption[];
    textures: ToolOption[];

    constructor(public toolsService: ToolsService, public brushService: BrushService, public rectangleSelectionService: RectangleSelectorService) {
        this.selectionTools = [
            { id: drawingToolId.rectangleSelectionService, name: 'Selection Rectangulaire' },
            { id: drawingToolId.ellipseSelectionService, name: 'Selection Elliptique' },
        ];
        this.tracingTools = [
            { id: drawingToolId.pencilService, name: 'Crayon' },
            { id: drawingToolId.brushService, name: 'Pinceau' },
        ];
        this.shapesTools = [
            { id: drawingToolId.rectangleService, name: 'Rectangle' },
            { id: drawingToolId.ellipseService, name: 'Ellipse' },
        ];
        this.tracingTypes = [
            { id: TraceTypes.fill, name: 'Rempli' },
            { id: TraceTypes.stroke, name: 'Contour' },
            { id: TraceTypes.fillAndStroke, name: 'Contour et rempli' },
        ];
        this.textures = [
            { id: Texture.one, name: 'Texture Une' },
            { id: Texture.two, name: 'Texture Deux' },
            { id: Texture.three, name: 'Texture Trois' },
            { id: Texture.four, name: 'Texture Quatre' },
            { id: Texture.five, name: 'Texture Cinq' },
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
}
