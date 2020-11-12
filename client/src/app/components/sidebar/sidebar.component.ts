import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { GuideComponent } from '@app/components/guide/guide.component';
import { ExportPopupComponent } from '@app/components/popup/export-popup/export-popup.component';
import { SavePopupComponent } from '@app/components/popup/save-popup/save-popup.component';
import { SidebarTool } from '@app/components/sidebar/sidebar-tool/sidebar-tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { drawingToolId, Options, SelectionType, sidebarToolID } from '@app/shared/enum';

declare type callback = () => void;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    sideBarToolsTop: SidebarTool[];
    sideBarToolsBottom: SidebarTool[];
    sideBarUndoRedoButtons: SidebarTool[];
    sideBarToolsTopMap: Map<sidebarToolID, SidebarTool> = new Map<sidebarToolID, SidebarTool>();
    sideBarToolsBottomMap: Map<sidebarToolID, SidebarTool> = new Map<sidebarToolID, SidebarTool>();

    showDrawingTools: boolean;
    isDialogOpen: boolean;

    constructor(
        private toolsService: ToolsService,
        private dialog: MatDialog,
        private drawingService: DrawingService,
        public undoRedo: UndoRedoService,
    ) {
        this.sideBarToolsTop = [
            { id: sidebarToolID.selection, name: 'Selection', defaultDrawingToolid: drawingToolId.selectionService },
            { id: sidebarToolID.tracing, name: 'Traçage', defaultDrawingToolid: drawingToolId.pencilService },
            { id: sidebarToolID.shapes, name: 'Figures', defaultDrawingToolid: drawingToolId.rectangleService },
            { id: sidebarToolID.line, name: 'Ligne', defaultDrawingToolid: drawingToolId.lineService },
            { id: sidebarToolID.text, name: 'Texte' },
            { id: sidebarToolID.paintBucket, name: 'Sceau', defaultDrawingToolid: drawingToolId.bucketService },
            { id: sidebarToolID.stamp, name: 'Étampe' },
            { id: sidebarToolID.pipette, name: 'Pipette', defaultDrawingToolid: drawingToolId.pipetteService },
            { id: sidebarToolID.eraser, name: 'Efface', defaultDrawingToolid: drawingToolId.eraserService },
        ];

        this.sideBarUndoRedoButtons = [
            { id: sidebarToolID.undo, name: 'annuler' },
            { id: sidebarToolID.redo, name: 'refaire' },
        ];

        this.sideBarToolsBottom = [
            { id: sidebarToolID.createNew, name: 'Nouveau dessin' },
            { id: sidebarToolID.saveCurrent, name: 'Sauvegarder' },
            { id: sidebarToolID.openCarrousel, name: 'Carroussel' },
            { id: sidebarToolID.exportCurrent, name: 'Exporter' },
            { id: sidebarToolID.openGuide, name: 'Ouvrir Guide' },
        ];
        this.sideBarToolsTop.forEach((object) => {
            this.sideBarToolsTopMap.set(object.id, object);
        });
        this.sideBarToolsBottom.forEach((object) => {
            this.sideBarToolsBottomMap.set(object.id, object);
        });
    }

    openCloseSidenav(id: sidebarToolID): void {
        if (this.toolsService._selectedSideBarToolID === id && this.toolsService.toolSidenavToggle.getValue() === true) {
            this.toolsService.closeToolSidenav();
        } else {
            this.toolsService.openToolSidenav();
        }
    }

    onButtonPressTop(object: SidebarTool | undefined): void {
        if (object) {
            this.openCloseSidenav(object.id);
            this.toolsService._selectedSideBarToolID = object.id;
            if (object.defaultDrawingToolid !== undefined) {
                this.toolsService._currentDrawingTool = object.defaultDrawingToolid;
            }
        }
    }

    onButtonPressBottom(id: sidebarToolID): void {
        switch (id) {
            case sidebarToolID.createNew: {
                this.undoRedo.clearPile();
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
            case sidebarToolID.openCarrousel: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(CarouselComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case sidebarToolID.saveCurrent: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(SavePopupComponent);
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
        if (event.shiftKey && event.ctrlKey) {
            keys = 'C-';
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
                this.onButtonPressBottom(sidebarToolID.exportCurrent);
            },
            'C-g': () => {
                this.onButtonPressBottom(sidebarToolID.openCarrousel);
            },
            'C-s': () => {
                this.onButtonPressBottom(sidebarToolID.saveCurrent);
            },
            'C-z': () => {
                this.undoRedo.undo();
            },
            'C-S-z': () => {
                this.undoRedo.redo();
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
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.tracing));
            },
            w: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.tracing));
                this.toolsService._currentDrawingTool = drawingToolId.brushService;
            },
            b: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.paintBucket)),
            e: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.eraser)),
            l: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.line)),
            r: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.ellipse);
            },

            s: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.ellipse);
            },
            i: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.pipette)),

            1: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.shapes));
            },
            2: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.shapes));
                this.toolsService._currentDrawingTool = drawingToolId.ellipseService;
            },
            3: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(sidebarToolID.shapes));
                this.toolsService._currentDrawingTool = drawingToolId.polygonService;
            },
        };
        const keys: string = this.getComposedKey(event);
        if (kbd[keys]) {
            const func: callback = kbd[keys];
            func();
        }
    }

    get showUndo(): boolean {
        return this.undoRedo.undoPile.length > 0;
    }

    get showRedo(): boolean {
        return this.undoRedo.redoPile.length > 0;
    }
}
