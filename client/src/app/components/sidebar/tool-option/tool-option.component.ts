import { Component } from '@angular/core';
import { ToolId } from '../../../shared/enum';
// import { Tool } from '../../../classes/tool';

@Component({
    selector: 'app-tool-option',
    templateUrl: './tool-option.component.html',
    styleUrls: ['./tool-option.component.scss'],
})
export class ToolOptionComponent {

    id: ToolId
    thickness: number;
    color: string;
    /*export const toolOption: Tool[] = {

    }*/
    constructor() {
    }

}
