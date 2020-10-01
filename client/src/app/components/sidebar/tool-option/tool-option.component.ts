import { Component } from '@angular/core';
import { drawingToolId } from '@app/shared/enum';

@Component({
    selector: 'app-tool-option',
    templateUrl: './tool-option.component.html',
    styleUrls: ['./tool-option.component.scss'],
})
export class ToolOptionComponent {
    public id: drawingToolId;
    public name: string;
    public thickness: number;
    public outlineType?: string;
    public color: string;
    constructor() {
        /*no empty*/
    }
}
