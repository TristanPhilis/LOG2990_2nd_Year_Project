import { ComponentType } from '@angular/cdk/portal';
import { Component, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { GuideComponent } from '@app/components/guide/guide.component';
import { ExportPopupComponent } from '@app/components/popup/export-popup/export-popup.component';
import { SavePopupComponent } from '@app/components/popup/save-popup/save-popup.component';
import { SidebarTool } from '@app/components/sidebar/sidebar-tool/sidebar-tool';
import { ClipboardService } from '@app/services/clipboard/clipboard-service';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { SelectionService } from '@app/services/tools/selection/selection-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { DrawingToolId, Options, SelectionType, SidebarToolID } from '@app/shared/enum';

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
        private canvasSizeService: CanvasSizeService,
        public undoRedo: UndoRedoService,
        private clipBoard: ClipboardService,
        private shortCurtsService: ShortcutService,
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

        this.addShortcuts();
    }

    openCloseSidenav(id: SidebarToolID): void {
        if (this.toolsService.selectedSideBarTool.id === id && this.toolsService.toolSidenavToggle.getValue() === true) {
            this.toolsService.closeToolSidenav();
        } else {
            this.toolsService.openToolSidenav();
        }
    }

    onButtonPressTop(object: SidebarTool | undefined): void {
        if (object) {
            this.openCloseSidenav(object.id);
            this.toolsService.selectedSideBarTool = object;
            if (object.defaultDrawingToolid !== undefined) {
                this.toolsService.setCurrentDrawingTool(object.defaultDrawingToolid);
            }
        }
    }

    onButtonPressBottom(id: SidebarToolID): void {
        this.toolsService.currentDrawingTool.onToolChange();
        switch (id) {
            case SidebarToolID.createNew: {
                this.createNewDrawing();
                break;
            }
            case SidebarToolID.openGuide: {
                this.openDialog(GuideComponent);
                break;
            }
            case SidebarToolID.openCarrousel: {
                this.openDialog(CarouselComponent, { width: '90%', height: '70%' });
                break;
            }
            case SidebarToolID.saveCurrent: {
                this.openDialog(SavePopupComponent);
                break;
            }
            case SidebarToolID.exportCurrent: {
                this.openDialog(ExportPopupComponent);
                break;
            }
        }
    }

    private openDialog<T>(component: ComponentType<T>, config?: MatDialogConfig): void {
        this.shortCurtsService.shortcutsEnabled = false;
        const dialogRef = this.dialog.open(component, config);
        dialogRef.afterClosed().subscribe(() => {
            this.shortCurtsService.shortcutsEnabled = true;
        });
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
        if (this.shortCurtsService.shortcutsEnabled) {
            event.preventDefault();
        }
        this.shortCurtsService.execute(keys);
        this.toolsService.openToolSidenav();
    }

    private addShortcuts(): void {
        this.shortCurtsService.shortcuts
            .set('C-o', () => {
                this.createNewDrawing();
            })
            .set('C-e', () => {
                this.onButtonPressBottom(SidebarToolID.exportCurrent);
            })
            .set('C-g', () => {
                this.onButtonPressBottom(SidebarToolID.openCarrousel);
            })
            .set('C-s', () => {
                this.onButtonPressBottom(SidebarToolID.saveCurrent);
            })
            .set('C-z', () => {
                this.undoRedo.undo();
            })
            .set('C-S-z', () => {
                this.undoRedo.redo();
            })
            .set('C-c', () => {
                this.clipBoard.copy();
            })
            .set('C-x', () => {
                this.clipBoard.cut();
            })
            .set('C-v', () => {
                this.clipBoard.paste();
                if (this.toolsService.selectedSideBarTool.id !== SidebarToolID.selection) {
                    this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                    this.toolsService.updateOptionValue(Options.selectionType, SelectionType.rectangle);
                }
            })
            .set('C-a', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                (this.toolsService.getTool(DrawingToolId.selectionService) as SelectionService).selectAllCanvas();
            })
            .set('c', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
            })
            .set('w', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.brushService);
            })
            .set('p', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.tracing));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.featherService);
            })
            .set('d', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.stamp)))
            .set('a', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.aerosol)))
            .set('b', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.paintBucket)))
            .set('e', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.eraser)))
            .set('l', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.line)))
            .set('r', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.rectangle);
            })
            .set('s', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.ellipse);
            })
            .set('v', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.selection));
                this.toolsService.updateOptionValue(Options.selectionType, SelectionType.magic);
            })
            .set('i', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.pipette)))
            .set('t', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.text)))
            .set('1', () => this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.shapes)))
            .set('2', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.shapes));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.ellipseService);
            })
            .set('3', () => {
                this.onButtonPressTop(this.sideBarToolsTopMap.get(SidebarToolID.shapes));
                this.toolsService.setCurrentDrawingTool(DrawingToolId.polygonService);
            })
            .set('delete', () => this.clipBoard.delete());
        this.shortCurtsService.alwaysEnabledShorcuts.add('delete').add('C-c').add('C-x').add('C-v');
    }

    private createNewDrawing(): void {
        this.undoRedo.clearPile();
        this.shortCurtsService.shortcutsEnabled = false;
        const dialogRef = this.dialog.open(CreateNewDrawingComponent);
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.canvasSizeService.restoreInitialSize();
                this.shortCurtsService.shortcutsEnabled = true;
            }
        });
    }

    get selectedSideBarToolId(): SidebarToolID {
        return this.toolsService.selectedSideBarTool.id;
    }

    get showUndo(): boolean {
        return this.undoRedo.undoPile.length > 0 && this.shortCurtsService.shortcutsEnabled;
    }

    get showRedo(): boolean {
        return this.undoRedo.redoPile.length > 0 && this.shortCurtsService.shortcutsEnabled;
    }
}
