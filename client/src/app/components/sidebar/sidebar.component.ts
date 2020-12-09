import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { GuideComponent } from '@app/components/guide/guide.component';
import { ExportPopupComponent } from '@app/components/popup/export-popup/export-popup.component';
import { SavePopupComponent } from '@app/components/popup/save-popup/save-popup.component';
import { SidebarTool } from '@app/components/sidebar/sidebar-tool/sidebar-tool';
import { ClipboardService } from '@app/services/clipboard/clipboard-service';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { TextService } from '@app/services/tools/text-service';
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
    private sideBarToolsTopMap: Map<SidebarToolID, SidebarTool> = new Map<SidebarToolID, SidebarTool>();

    isDialogOpen: boolean;

    constructor(
        private toolsService: ToolsService,
        private dialog: MatDialog,
        private textService: TextService,
        private canvasSizeService: CanvasSizeService,
        public undoRedo: UndoRedoService,
        private clipBoard: ClipboardService,
    ) {
        this.sideBarToolsTop = [
            { id: SidebarToolID.tracing, name: 'Traçage', defaultDrawingToolid: DrawingToolId.pencilService },
            { id: SidebarToolID.line, name: 'Ligne', defaultDrawingToolid: DrawingToolId.lineService },
            { id: SidebarToolID.text, name: 'Texte', defaultDrawingToolid: DrawingToolId.textService },
            { id: SidebarToolID.shapes, name: 'Figures', defaultDrawingToolid: DrawingToolId.rectangleService },
            { id: SidebarToolID.paintBucket, name: 'Seau', defaultDrawingToolid: DrawingToolId.bucketService },
            { id: SidebarToolID.aerosol, name: 'Aerosol', defaultDrawingToolid: DrawingToolId.aerosolService },
            { id: SidebarToolID.stamp, name: 'Étampe', defaultDrawingToolid: DrawingToolId.stampService },
            { id: SidebarToolID.eraser, name: 'Efface', defaultDrawingToolid: DrawingToolId.eraserService },
            { id: SidebarToolID.pipette, name: 'Pipette', defaultDrawingToolid: DrawingToolId.pipetteService },
            { id: SidebarToolID.selection, name: 'Selection', defaultDrawingToolid: DrawingToolId.selectionService },
            { id: SidebarToolID.grid, name: 'Grille' },
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
    }

    openCloseSidenav(id: SidebarToolID): void {
        if (this.toolsService.selectedSideBarTool.id === id && this.toolsService.toolSidenavToggle.getValue() === true) {
            this.toolsService.closeToolSidenav();
        } else {
            this.toolsService.openToolSidenav();
        }
    }

    onButtonPressTop(object: SidebarTool | undefined): void {
        if (this.toolsService.currentDrawingToolID === DrawingToolId.textService) {
            this.textService.confirmTextFromOther();
        }
        if (object) {
            this.openCloseSidenav(object.id);
            this.toolsService.selectedSideBarTool = object;
            if (object.defaultDrawingToolid !== undefined) {
                this.toolsService.setCurrentDrawingTool(object.defaultDrawingToolid);
            }
        }
    }

    onButtonPressBottom(id: SidebarToolID): void {
        if (this.toolsService.currentDrawingToolID === DrawingToolId.textService) {
            this.textService.confirmTextFromOther();
        }
        switch (id) {
            case SidebarToolID.createNew: {
                this.createNewDrawing();
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
                const dialogRef = this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });

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
                this.createNewDrawing();
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
            'C-c': () => {
                this.clipBoard.copy();
            },
            'C-x': () => {
                this.clipBoard.cut();
            },
            'C-v': () => {
                this.clipBoard.paste();
                if (this.toolsService.selectedSideBarTool.id !== SidebarToolID.selection) {
                    this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                    this.toolsService.updateOptionValue(Options.selectionType, SelectionType.rectangle);
                }
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
        if (this.toolsService.currentDrawingToolID === DrawingToolId.textService && this.textService.writingMode) {
            return;
        }
        const kbd: { [id: string]: callback } = {
            c: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
            },
            d: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.stamp));
            },
            w: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.brushService);
            },
            p: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.featherService);
            },

            a: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.aerosol)),
            b: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.paintBucket)),
            e: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.eraser)),
            l: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.line)),
            r: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.rectangle);
            },
            s: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.ellipse);
            },
            v: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.magic);
            },
            i: () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.pipette)),

            t: () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.text));
            },

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
            delete: () => {
                this.clipBoard.delete();
            },
        };
        const keys: string = this.getComposedKey(event);
        if (kbd[keys]) {
            const func: callback = kbd[keys];
            func();
            this.toolsService.openToolSidenav();
        }
    }

    private createNewDrawing(): void {
        this.undoRedo.clearPile();
        this.isDialogOpen = true;
        const dialogRef = this.dialog.open(CreateNewDrawingComponent);
        dialogRef.afterClosed().subscribe(() => {
            this.canvasSizeService.restoreInitialSize();
            this.isDialogOpen = false;
        });
    }

    get selectedSideBarToolId(): SidebarToolID {
        return this.toolsService.selectedSideBarTool.id;
    }

    get showUndo(): boolean {
        return this.undoRedo.undoPile.length > 0;
    }

    get showRedo(): boolean {
        return this.undoRedo.redoPile.length > 0;
    }
}
