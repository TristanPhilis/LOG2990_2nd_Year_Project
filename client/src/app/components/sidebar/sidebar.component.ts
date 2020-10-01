import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GuideComponent } from '@app/components/guide/guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { SidebarToolComponent } from './sidebar-tool/sidebar-tool.component';
// tslint:disable-next-line: no-relative-imports

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    sideBarToolsTop: SidebarToolComponent[];
    sideBarToolsBottom: SidebarToolComponent[];

    showDrawingTools: boolean;

    constructor(private toolsService: ToolsService, private dialog: MatDialog, private drawingService: DrawingService) {
        this.sideBarToolsTop = [
            { id: sidebarToolID.move, name: 'Select & Move' },
            { id: sidebarToolID.selection, name: 'Selection' },
            { id: sidebarToolID.tracing, name: 'Tracing' },
            { id: sidebarToolID.shapes, name: 'Shapes' },
            { id: sidebarToolID.line, name: 'Line' },
            { id: sidebarToolID.text, name: 'Text' },
            { id: sidebarToolID.paintBucket, name: 'Bucket' },
            { id: sidebarToolID.stamp, name: 'Stamp' },
            { id: sidebarToolID.pipette, name: 'Pipette' },
            { id: sidebarToolID.eraser, name: 'Eraser' },
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
                this.toolsService._selectedSideBarToolID = sidebarToolID.tracing;
                this.toolsService._currentDrawingTool = drawingToolId.pencilService;
                break;
            }
            case sidebarToolID.shapes: {
                this.toolsService._selectedSideBarToolID = sidebarToolID.shapes;
                this.toolsService._currentDrawingTool = drawingToolId.rectangleService;

                break;
            }
            case sidebarToolID.eraser: {
                this.toolsService._selectedSideBarToolID = sidebarToolID.eraser;
                this.toolsService._currentDrawingTool = drawingToolId.eraserService;
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
        }
    }
}
