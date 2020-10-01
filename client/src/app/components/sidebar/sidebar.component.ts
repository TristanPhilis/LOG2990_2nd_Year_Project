import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { sidebarToolID } from '@app/shared/enum';
import { GuideComponent } from '../guide/guide.component';
import { SidebarToolComponent } from './sidebar-tool/sidebar-tool.component';
// tslint:disable-next-line: no-relative-imports

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    public sideBarToolsTop: SidebarToolComponent[];
    public sideBarToolsBottom: SidebarToolComponent[];

    public showDrawingTools: boolean;

    constructor(private toolsService: ToolsService, private dialog: MatDialog, private drawingService: DrawingService) {
        toolsService.showTracingTools = false;

        this.sideBarToolsTop = [
            { id: sidebarToolID.move, name: 'Select & Move' },
            { id: sidebarToolID.cropping, name: 'Crop' },
            { id: sidebarToolID.tracing, name: 'Tracing' },
            { id: sidebarToolID.shapes, name: 'Shapes' },
            { id: sidebarToolID.text, name: 'Text' },
            { id: sidebarToolID.filling, name: 'Fill' },
        ];
        this.sideBarToolsBottom = [
            { id: sidebarToolID.createNew, name: 'New Drawing' },
            { id: sidebarToolID.saveCurrent, name: 'Save Drawing' },
            { id: sidebarToolID.openCarrousel, name: 'Open Carrousel' },
            { id: sidebarToolID.exportCurrent, name: 'Export Drawing' },
            { id: sidebarToolID.openGuide, name: 'Open Guide' },
        ];
    }

    onButtonPress(id: sidebarToolID): void {
        switch (id) {
            case sidebarToolID.tracing: {
                if (!this.toolsService.showTracingTools) {
                    this.toolsService.showTracingTools = true;
                } else {
                    this.toolsService.showTracingTools = false;
                }
                break;
            }
            case sidebarToolID.shapes: {
                if (!this.toolsService.showShapesTools) {
                    this.toolsService.showShapesTools = true;
                } else {
                    this.toolsService.showShapesTools = false;
                }
                break;
            }
            case sidebarToolID.createNew: {
                this.drawingService.clearCanvas(this.drawingService.baseCtx);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                break;
            }
            case sidebarToolID.openGuide: {
                const dialogRef = this.dialog.open(GuideComponent);

                dialogRef.afterClosed().subscribe((result) => {
                    console.log(`Dialog result: ${result}`);
                });
                break;
            }
            // default: {
            //     this.toolsService.showTracingTools = false;
            //     this.toolsService.showShapesTools = false;
            //     break;
            // }
        }
    }
}
