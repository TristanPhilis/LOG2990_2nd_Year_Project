import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { GuideComponent } from '@app/components/guide/guide.component';
import { ExportPopupComponent } from '@app/components/popup/export-popup/export-popup.component';
import { SavePopupComponent } from '@app/components/popup/save-popup/save-popup.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { SidebarToolComponent } from './sidebar-tool/sidebar-tool.component';

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
    private isDialogOpen: boolean;

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
            case sidebarToolID.paintBucket: {
                this.toolsService._selectedSideBarToolID = sidebarToolID.paintBucket;
                this.toolsService._currentDrawingTool = drawingToolId.bucketService;
                break;
            }
            case sidebarToolID.createNew: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(CreateNewDrawingComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case sidebarToolID.openGuide: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(GuideComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case sidebarToolID.exportCurrent: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(ExportPopupComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case sidebarToolID.openCarrousel: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });

                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case sidebarToolID.saveCurrent: {
                const dialogRef = this.dialog.open(SavePopupComponent);
                this.isDialogOpen = true;
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
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
            'C-e': () => {
                this.onButtonPress(sidebarToolID.exportCurrent);
            },
        };
        const func: callback | undefined = kbd[keys];
        if (func) {
            // event.preventDefault();
            func();
        }
    }

    @HostListener('window: keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        if (this.isDialogOpen) {
            return;
        }
        const kbd: { [id: string]: callback } = {
            c: () => {
                this.onButtonPress(sidebarToolID.tracing);
                this.toolsService._currentDrawingTool = drawingToolId.pencilService;
            },
            w: () => {
                this.onButtonPress(sidebarToolID.tracing);
                this.toolsService._currentDrawingTool = drawingToolId.brushService;
            },
            b: () => this.onButtonPress(sidebarToolID.paintBucket),
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
            3: () => {
                this.onButtonPress(sidebarToolID.shapes);
                this.toolsService._currentDrawingTool = drawingToolId.polygonService;
            },
        };
        const keys: string = this.getComposedKey(event);
        if (kbd[keys]) {
            const func: callback = kbd[keys];
            func();
        }
    }
}
