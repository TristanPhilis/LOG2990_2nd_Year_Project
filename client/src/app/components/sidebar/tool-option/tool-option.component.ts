import { Component } from '@angular/core';
import { ToolId } from '@app/shared/enum';

@Component({
    selector: 'app-tool-option',
    templateUrl: './tool-option.component.html',
    styleUrls: ['./tool-option.component.scss'],
})
export class ToolOptionComponent {
    id: ToolId;
    thickness: number;
    color: string;
    constructor() {
        /*no empty*/
    }
}
