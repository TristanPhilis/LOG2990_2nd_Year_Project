import { Component } from '@angular/core';
import { drawingToolId, TraceTypes } from '@app/shared/enum';

@Component({
    selector: 'app-tool-option',
    templateUrl: './tool-option.component.html',
    styleUrls: ['./tool-option.component.scss'],
})
export class ToolOptionComponent {
    id: drawingToolId | TraceTypes;
    name: string;
    constructor() {
        /*no empty*/
    }
}
