import { Component } from '@angular/core';
import { drawingToolId } from '@app/shared/enum';

@Component({
    selector: 'app-tool-option',
    templateUrl: './tool-option.component.html',
    styleUrls: ['./tool-option.component.scss'],
})
export class ToolOptionComponent {
    id: drawingToolId;
    name: string;
    thickness: number;
    outlineType?: string;
    color: string;
    constructor() {
        /*no empty*/
    }
}
