import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GuideComponent } from '@app/components/guide/guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { SidebarToolComponent } from './sidebar-tool/sidebar-tool.component';
// tslint:disable-next-line: no-relative-imports
declare type callback = () => void;

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
            case sidebarToolID.line: {
                this.toolsService._selectedSideBarToolID = sidebarToolID.line;
                this.toolsService._currentDrawingTool = drawingToolId.lineService;
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

    private getComposedKey(event: KeyboardEvent): string {
        let keys = '';
        if (event.ctrlKey) {
            keys += 'C-';
        }
        if (event.shiftKey) {
            keys += 'S-';
        }
        keys += event.key.toLowerCase();
        return keys;
    }

    @HostListener('window: keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const keys: string = this.getComposedKey(event);
        const kbd: { [id: string]: callback } = {
            'C-o': () => {
                this.drawingService.clearCanvas(this.drawingService.baseCtx);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            },
        };
        const func: callback | undefined = kbd[keys];
        if (func) {
            event.preventDefault();
            func();
        }
    }

    @HostListener('window: keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        const kbd: { [id: string]: callback } = {
            c: () => {
                this.onButtonPress(sidebarToolID.tracing);
                this.toolsService._currentDrawingTool = drawingToolId.pencilService;
            },
            e: () => this.onButtonPress(sidebarToolID.eraser),
            l: () => this.onButtonPress(sidebarToolID.line),
            1: () => {
                this.onButtonPress(sidebarToolID.shapes);
                this.toolsService._currentDrawingTool = drawingToolId.rectangleService;
            },
            2: () => {
                this.onButtonPress(sidebarToolID.shapes);
                this.toolsService._currentDrawingTool = drawingToolId.ellipseService;
            },
        };
        const keys: string = this.getComposedKey(event);
        if (kbd[keys]) {
            const func: callback = kbd[keys];
            func();
        }
    }
}
