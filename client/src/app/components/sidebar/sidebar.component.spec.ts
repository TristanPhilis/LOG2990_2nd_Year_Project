import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GuideComponent } from '@app/components/guide/guide.component';
import { ClipboardService } from '@app/services/clipboard/clipboard-service';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { ToolsService } from '@app/services/tools/tools-service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { DrawingToolId, SidebarToolID } from '@app/shared/enum';
import { of } from 'rxjs';
import { SidebarTool } from './sidebar-tool/sidebar-tool';
import { SidebarComponent } from './sidebar.component';

// class ToolStub extends Tool {}

// tslint:disable:no-any
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let getComposedKeySpy: jasmine.Spy<any>;
    let keyEvent: KeyboardEvent;
    let toolsService: ToolsService;
    let canvasSizeServiceSpy: jasmine.SpyObj<CanvasSizeService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<GuideComponent, any>>;
    let clipBoardSpy: jasmine.SpyObj<ClipboardService>;

    beforeEach(
        waitForAsync(() => {
            dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
            dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
            dialogSpy.open.and.returnValue(dialogRefSpyObj);

            canvasSizeServiceSpy = jasmine.createSpyObj('CanvasSizeService', ['restoreInitialSize']);

            undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo', 'clearPile']);
            clipBoardSpy = jasmine.createSpyObj('ClipboardService', ['copy', 'cut', 'paste', 'delete']);
            undoRedoServiceSpy.undoPile = [];
            undoRedoServiceSpy.redoPile = [];

            TestBed.configureTestingModule({
                imports: [MatDialogModule, BrowserModule, BrowserAnimationsModule, MatIconModule],
                declarations: [SidebarComponent],
                providers: [
                    { provide: CanvasSizeService, useValue: canvasSizeServiceSpy },
                    { provide: MatDialog, useValue: dialogSpy },
                    { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                    { provide: ClipboardService, useValue: clipBoardSpy },
                ],
            }).compileComponents();
            toolsService = TestBed.inject(ToolsService);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        getComposedKeySpy = spyOn<any>(component, 'getComposedKey').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('if selecting the same tool and the sidebar is open, should close it', () => {
        // tslint:disable:no-string-literal private service
        spyOn(component['toolsService'].toolSidenavToggle, 'getValue').and.returnValue(true);
        component['toolsService'].selectedSideBarTool = { id: SidebarToolID.aerosol } as SidebarTool;
        const closeSpy = spyOn(component['toolsService'], 'closeToolSidenav');
        // tslint:enable:no-string-literal
        component.openCloseSidenav(SidebarToolID.aerosol);
        expect(closeSpy).toHaveBeenCalled();
    });

    it('should return the string for the ctrl+key that is pressed', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'u',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        expect(getComposedKeySpy(keyEvent)).toEqual('C-u');
    });
    it('should return the string for the shift+key that is pressed', () => {
        keyEvent = {
            shiftKey: true,
            key: 'u',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        expect(getComposedKeySpy(keyEvent)).toEqual('S-u');
    });
    it('should return the string for the ctrl+shift+key that is pressed', () => {
        keyEvent = {
            ctrlKey: true,
            shiftKey: true,
            key: 'u',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        expect(getComposedKeySpy(keyEvent)).toEqual('C-S-u');
    });

    // onKeyDown
    it('should call getComposedKey() with onKeyDown', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'h',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(getComposedKeySpy).toHaveBeenCalled();
    });
    it('should clear Canvas with onKeyDown', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'o',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(canvasSizeServiceSpy.restoreInitialSize).toHaveBeenCalled();
    });
    it('should trigger export with onKeyDown', () => {
        const onButtonPressBottomSpy = spyOn<any>(component, 'onButtonPressBottom');
        keyEvent = {
            ctrlKey: true,
            key: 'e',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(onButtonPressBottomSpy).toHaveBeenCalledWith(SidebarToolID.exportCurrent);
    });
    it('should trigger carroussel with onKeyDown', () => {
        const onButtonPressBottomSpy = spyOn<any>(component, 'onButtonPressBottom');
        keyEvent = {
            ctrlKey: true,
            key: 'g',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(onButtonPressBottomSpy).toHaveBeenCalledWith(SidebarToolID.openCarrousel);
    });
    it('should trigger save popup with onKeyDown', () => {
        const onButtonPressBottomSpy = spyOn<any>(component, 'onButtonPressBottom');
        keyEvent = {
            ctrlKey: true,
            key: 's',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(onButtonPressBottomSpy).toHaveBeenCalledWith(SidebarToolID.saveCurrent);
    });
    it('should undo with onKeydown', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'z',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(undoRedoServiceSpy.undo).toHaveBeenCalled();
    });
    it('should redo with onKeydown', () => {
        keyEvent = {
            ctrlKey: true,
            shiftKey: true,
            key: 'z',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(undoRedoServiceSpy.redo).toHaveBeenCalled();
    });

    it('should copy with onKeydown', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'c',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(clipBoardSpy.copy).toHaveBeenCalled();
    });

    it('should cut with onKeydown', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'x',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(clipBoardSpy.cut).toHaveBeenCalled();
    });

    it('should paste with onKeydown', () => {
        keyEvent = {
            ctrlKey: true,
            key: 'v',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(clipBoardSpy.paste).toHaveBeenCalled();
    });

    it('should delete selection when delete is pressed on keyboard', () => {
        keyEvent = {
            key: 'delete',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(clipBoardSpy.delete).toHaveBeenCalled();
    });

    // onButtonPressBottom
    it('should open Dialog to create new drawing', () => {
        component.onButtonPressBottom(SidebarToolID.createNew);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog that is guide', () => {
        component.onButtonPressBottom(SidebarToolID.openGuide);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog to export drawing', () => {
        component.onButtonPressBottom(SidebarToolID.exportCurrent);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog to show carroussel', () => {
        component.onButtonPressBottom(SidebarToolID.openCarrousel);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog to save drawing', () => {
        component.onButtonPressBottom(SidebarToolID.saveCurrent);
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    // onKeyDown
    it('should not call onButtonPressTop when dialog is open and onKeyDown', () => {
        const onButtonPressBottomSpy = spyOn<any>(component, 'onButtonPressBottom');
        component.isDialogOpen = true;
        const pressC = new KeyboardEvent('keypress', { key: 'c' });
        component.onKeyDown(pressC);
        expect(onButtonPressBottomSpy).not.toHaveBeenCalled();
    });
    it('should return pencil when c is press on keyboard ', () => {
        const pressC = new KeyboardEvent('keypress', { key: 'c' });
        component.onKeyDown(pressC);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.pencilService);
    });
    it('should return brush when w is pressed on keyboard', () => {
        const pressW = new KeyboardEvent('keypress', { key: 'w' });
        component.onKeyDown(pressW);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.brushService);
    });
    it('should return feather when p is pressed on keyboard', () => {
        const pressP = new KeyboardEvent('keypress', { key: 'p' });
        component.onKeyDown(pressP);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.featherService);
    });
    it('should return paint bucket when b is pressed on keyboard', () => {
        const pressB = new KeyboardEvent('keypress', { key: 'b' });
        component.onKeyDown(pressB);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.bucketService);
    });
    it('should return erase when e is press on keyboard ', () => {
        const pressE = new KeyboardEvent('keypress', { key: 'e' });
        component.onKeyDown(pressE);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.eraserService);
    });
    it('should return line when l is press on keyboard ', () => {
        const pressL = new KeyboardEvent('keypress', { key: 'l' });
        component.onKeyDown(pressL);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.lineService);
    });
    it('should return pipette when i is pressed on keyboard', () => {
        const pressI = new KeyboardEvent('keypress', { key: 'i' });
        component.onKeyDown(pressI);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.pipetteService);
    });
    it('should return rectangle when 1 is press on keyboard ', () => {
        const press1 = new KeyboardEvent('keypress', { key: '1' });
        component.onKeyDown(press1);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.rectangleService);
    });
    it('should return ellipse when 2 is press on keyboard ', () => {
        const press2 = new KeyboardEvent('keypress', { key: '2' });
        component.onKeyDown(press2);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.ellipseService);
    });
    it('should return polygon when 3 is pressed on keyboard', () => {
        const press3 = new KeyboardEvent('keypress', { key: '3' });
        component.onKeyDown(press3);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.polygonService);
    });
    it('should return selection when r is pressed on keyboard', () => {
        const pressR = new KeyboardEvent('keypress', { key: 'r' });
        component.onKeyDown(pressR);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.selectionService);
    });
    it('should return selection when r is pressed on keyboard', () => {
        const pressS = new KeyboardEvent('keypress', { key: 's' });
        component.onKeyDown(pressS);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.selectionService);
    });
    it('should return selection when r is pressed on keyboard', () => {
        const pressV = new KeyboardEvent('keypress', { key: 'v' });
        component.onKeyDown(pressV);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.selectionService);
    });
    it('should return stamp when d is pressed on keyboard', () => {
        const pressD = new KeyboardEvent('keypress', { key: 'd' });
        component.onKeyDown(pressD);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.stampService);
    });
    it('should return selection when a is pressed on keyboard', () => {
        const pressA = new KeyboardEvent('keypress', { key: 'a' });
        component.onKeyDown(pressA);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.aerosolService);
    });
});
