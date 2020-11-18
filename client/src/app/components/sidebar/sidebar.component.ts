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
import { DrawingToolId, Options, SelectionType, SidebarToolID } from '@app/shared/enum';

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
    sideBarToolsTopMap: Map<SidebarToolID, SidebarTool> = new Map<SidebarToolID, SidebarTool>();
    sideBarToolsBottomMap: Map<SidebarToolID, SidebarTool> = new Map<SidebarToolID, SidebarTool>();

    showDrawingTools: boolean;
    isDialogOpen: boolean;

    constructor(
        private toolsService: ToolsService,
        private dialog: MatDialog,
        private drawingService: DrawingService,
        public undoRedo: UndoRedoService,
    ) {
        this.sideBarToolsTop = [
            { id: SidebarToolID.selection, name: 'Selection', defaultDrawingToolid: DrawingToolId.selectionService },
            { id: SidebarToolID.grid, name: 'Grille' },
            { id: SidebarToolID.tracing, name: 'Traçage', defaultDrawingToolid: DrawingToolId.pencilService },
            { id: SidebarToolID.shapes, name: 'Figures', defaultDrawingToolid: DrawingToolId.rectangleService },
            { id: SidebarToolID.line, name: 'Ligne', defaultDrawingToolid: DrawingToolId.lineService },
            { id: SidebarToolID.text, name: 'Texte' },
            { id: SidebarToolID.paintBucket, name: 'Sceau', defaultDrawingToolid: DrawingToolId.bucketService },
            { id: SidebarToolID.stamp, name: 'Étampe', defaultDrawingToolid: DrawingToolId.stampService },
            { id: SidebarToolID.pipette, name: 'Pipette', defaultDrawingToolid: DrawingToolId.pipetteService },
            { id: SidebarToolID.eraser, name: 'Efface', defaultDrawingToolid: DrawingToolId.eraserService },
        ];

        this.sideBarUndoRedoButtons = [
            { id: SidebarToolID.undo, name: 'annuler' },
            { id: SidebarToolID.redo, name: 'refaire' },
        ];

        this.sideBarToolsBottom = [
            { id: SidebarToolID.createNew, name: 'Nouveau dessin' },
            { id: SidebarToolID.saveCurrent, name: 'Sauvegarder' },
            { id: SidebarToolID.openCarrousel, name: 'Carroussel' },
            { id: SidebarToolID.exportCurrent, name: 'Exporter' },
            { id: SidebarToolID.openGuide, name: 'Ouvrir Guide' },
        ];
        this.sideBarToolsTop.forEach((object) => {
            this.sideBarToolsTopMap.set(object.id, object);
        });
        this.sideBarToolsBottom.forEach((object) => {
            this.sideBarToolsBottomMap.set(object.id, object);
        });
    }

    openCloseSidenav(id: SidebarToolID): void {
        if (this.toolsService.selectedSideBarToolID === id && this.toolsService.toolSidenavToggle.getValue() === true) {
            this.toolsService.closeToolSidenav();
        } else {
            this.toolsService.openToolSidenav();
        }
    }

    onButtonPressTop(object: SidebarTool | undefined): void {
        if (object) {
            this.openCloseSidenav(object.id);
            this.toolsService.selectedSideBarToolID = object.id;
            if (object.defaultDrawingToolid !== undefined) {
                this.toolsService.setCurrentDrawingTool(object.defaultDrawingToolid);
            }
        }
    }

    onButtonPressBottom(id: SidebarToolID): void {
        switch (id) {
            case SidebarToolID.createNew: {
                this.undoRedo.clearPile();
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(CreateNewDrawingComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case SidebarToolID.openGuide: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(GuideComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case SidebarToolID.openCarrousel: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(CarouselComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case SidebarToolID.saveCurrent: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(SavePopupComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case SidebarToolID.exportCurrent: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(ExportPopupComponent);
                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case SidebarToolID.openCarrousel: {
                this.isDialogOpen = true;
                const dialogRef = this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });

                dialogRef.afterClosed().subscribe(() => {
                    this.isDialogOpen = false;
                });
                break;
            }
            case SidebarToolID.saveCurrent: {
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
                this.onButtonPressBottom(SidebarToolID.exportCurrent);
            },
            'C-g': () => {
                this.onButtonPressBottom(SidebarToolID.openCarrousel);
            },
            'C-s': () => {
                this.onButtonPressBottom(SidebarToolID.saveCurrent);
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
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
            },
            w: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.brushService);
            },
            b: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.paintBucket)),
            e: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.eraser)),
            l: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.line)),
            r: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.ellipse);
            },

            s: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.ellipse);
            },
            i: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.pipette)),

            1: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.shapes));
            },
            2: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.shapes));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.ellipseService);
            },
            3: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.shapes));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.polygonService);
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
