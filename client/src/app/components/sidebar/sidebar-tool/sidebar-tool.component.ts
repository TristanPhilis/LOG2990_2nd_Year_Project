import { Component } from '@angular/core';
import { sidebarToolID } from '@app/shared/enum';

@Component({
    selector: 'app-sidebar-tool',
    templateUrl: './sidebar-tool.component.html',
    styleUrls: ['./sidebar-tool.component.scss'],
})
export class SidebarToolComponent {
    id: sidebarToolID;
    name: string;

    constructor() {}
}
