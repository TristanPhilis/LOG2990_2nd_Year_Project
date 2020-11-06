import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GuideComponent } from '@app/components/guide/guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';

// class ToolStub extends Tool {}

// tslint:disable:no-any
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let getComposedKeySpy: jasmine.Spy<any>;
    let keyEvent: KeyboardEvent;
    let toolsService: ToolsService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    // let toolStub: ToolStub;
    // let toolsServiceSpy: jasmine.SpyObj<ToolsService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<GuideComponent, any>>;

    beforeEach(
        waitForAsync(() => {
            dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
            dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
            dialogSpy.open.and.returnValue(dialogRefSpyObj);

            drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

            undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo', 'clearPile']);
            undoRedoServiceSpy.undoPile = [];
            undoRedoServiceSpy.redoPile = [];

            // toolStub = new ToolStub({} as DrawingService, {} as UndoRedoService, {} as ColorSelectionService);
            // toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['closeToolSidenav', 'openToolSidenav']);
            // toolsServiceSpy.currentDrawingTool = toolStub;
            TestBed.configureTestingModule({
                imports: [MatDialogModule, BrowserModule, BrowserAnimationsModule],
                declarations: [SidebarComponent],
                providers: [
                    { provide: DrawingService, useValue: drawServiceSpy },
                    { provide: MatDialog, useValue: dialogSpy },
                    { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                    // { provide: ToolsService, useValue: toolsServiceSpy },
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

    // openCloseSidenav
    it('should close tool sidenav if same sidenav tool is clicked', () => {
        // toolsService.openToolSidenav();
        // toolsService._selectedSideBarToolID = sidebarToolID.pipette;
        // component.openCloseSidenav(sidebarToolID.pipette);
        // expect(toolsServiceSpy.closeToolSidenav).toHaveBeenCalled();
    });

    // getComposedKey
    it('should return the string for the ctrl+key that is pressed', () => {
        keyEvent = { ctrlKey: true, key: 'u' } as KeyboardEvent;
        expect(getComposedKeySpy(keyEvent)).toEqual('C-u');
    });
    it('should return the string for the shift+key that is pressed', () => {
        keyEvent = { shiftKey: true, key: 'u' } as KeyboardEvent;
        expect(getComposedKeySpy(keyEvent)).toEqual('S-u');
    });
    it('should return the string for the ctrl+shift+key that is pressed', () => {
        keyEvent = { ctrlKey: true, shiftKey: true, key: 'u' } as KeyboardEvent;
        expect(getComposedKeySpy(keyEvent)).toEqual('C-S-u');
    });

    // onKeyDown
    it('should call getComposedKey() with onKeyDown', () => {
        keyEvent = { ctrlKey: true, key: 'h' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(getComposedKeySpy).toHaveBeenCalled();
    });
    it('should clear Canvas with onKeyDown', () => {
        keyEvent = { ctrlKey: true, key: 'o' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('should trigger export with onKeyDown', () => {
        const onButtonPressBottomSpy = spyOn<any>(component, 'onButtonPressBottom');
        keyEvent = { ctrlKey: true, key: 'e' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(onButtonPressBottomSpy).toHaveBeenCalledWith(sidebarToolID.exportCurrent);
    });
    it('should undo with onKeydown', () => {
        keyEvent = { ctrlKey: true, key: 'z' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(undoRedoServiceSpy.undo).toHaveBeenCalled();
    });
    it('should redo with onKeydown', () => {
        keyEvent = { ctrlKey: true, shiftKey: true, key: 'z' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(undoRedoServiceSpy.redo).toHaveBeenCalled();
    });

    // onButtonPressBottom
    it('should open Dialog to create new drawing', () => {
        component.onButtonPressBottom(sidebarToolID.createNew);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog that is guide', () => {
        component.onButtonPressBottom(sidebarToolID.openGuide);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog to export drawing', () => {
        component.onButtonPressBottom(sidebarToolID.exportCurrent);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog to show carroussel', () => {
        component.onButtonPressBottom(sidebarToolID.openCarrousel);
        expect(dialogSpy.open).toHaveBeenCalled();
    });
    it('should open Dialog to save drawing', () => {
        component.onButtonPressBottom(sidebarToolID.saveCurrent);
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    // onKeyUp
    it('should not call onButtonPressTop when dialog is open and onKeyUp', () => {
        const onButtonPressBottomSpy = spyOn<any>(component, 'onButtonPressBottom');
        component.isDialogOpen = true;
        const pressC = new KeyboardEvent('keypress', { key: 'c' });
        component.onKeyUp(pressC);
        expect(onButtonPressBottomSpy).not.toHaveBeenCalled();
    });
    it('should return pencil when c is press on keyboard ', () => {
        const pressC = new KeyboardEvent('keypress', { key: 'c' });
        component.onKeyUp(pressC);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.pencilService);
    });
    it('should return brush when w is pressed on keyboard', () => {
        const pressW = new KeyboardEvent('keypress', { key: 'w' });
        component.onKeyUp(pressW);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.brushService);
    });
    it('should return paint bucket when b is pressed on keyboard', () => {
        const pressB = new KeyboardEvent('keypress', { key: 'b' });
        component.onKeyUp(pressB);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.bucketService);
    });
    it('should return erase when e is press on keyboard ', () => {
        const pressE = new KeyboardEvent('keypress', { key: 'e' });
        component.onKeyUp(pressE);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.eraserService);
    });
    it('should return line when l is press on keyboard ', () => {
        const pressL = new KeyboardEvent('keypress', { key: 'l' });
        component.onKeyUp(pressL);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.lineService);
    });
    it('should return pipette when i is pressed on keyboard', () => {
        const pressI = new KeyboardEvent('keypress', { key: 'i' });
        component.onKeyUp(pressI);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.pipetteService);
    });
    it('should return rectangle when 1 is press on keyboard ', () => {
        const press1 = new KeyboardEvent('keypress', { key: '1' });
        component.onKeyUp(press1);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.rectangleService);
    });
    it('should return ellipse when 2 is press on keyboard ', () => {
        const press2 = new KeyboardEvent('keypress', { key: '2' });
        component.onKeyUp(press2);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.ellipseService);
    });
    it('should return polygon when 3 is pressed on keyboard', () => {
        const press3 = new KeyboardEvent('keypress', { key: '3' });
        component.onKeyUp(press3);
        expect(toolsService._currentDrawingToolID).toEqual(drawingToolId.polygonService);
    });
});
