import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { drawingToolId, sidebarToolID } from '@app/shared/enum';
import { SidebarComponent } from './sidebar.component';

// tslint:disable:no-any
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let getComposedKeySpy: jasmine.Spy<any>;
    let keyEvent: KeyboardEvent;
    let toolsService: ToolsService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserModule, BrowserAnimationsModule],
            declarations: [SidebarComponent],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        }).compileComponents();
        toolsService = TestBed.inject(ToolsService);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        getComposedKeySpy = spyOn<any>(component, 'getComposedKey').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onKeyDown should call getComposedKey()', () => {
        component.onKeyDown(keyEvent);
        expect(getComposedKeySpy).toHaveBeenCalled();
    });

    it('onKeyDown should clear Canvas', () => {
        component.onKeyDown(keyEvent);
        // expect(drawServiceSpy.canvas.getContext('2D')).toEqual();
    });

    it('onButtonPress should set createNew', () => {
        component.onButtonPress(sidebarToolID.createNew);
        expect(toolsService._selectedSideBarToolID).toEqual(sidebarToolID.createNew);
    });

    it('onButtonPress should set openGuide', () => {
        component.onButtonPress(sidebarToolID.openGuide);
        expect(toolsService._selectedSideBarToolID).toEqual(sidebarToolID.openGuide);
    });

    it('should return pencil when c is press on keyboard ', () => {
        const pressC = new KeyboardEvent('keypress', { key: 'c' });
        component.onKeyUp(pressC);
        expect(drawingToolId.pencilService).toHaveBeenCalled();
    });

    it('should return erase when e is press on keyboard ', () => {
        const pressE = new KeyboardEvent('keypress', { key: 'e' });
        component.onKeyUp(pressE);
        expect(drawingToolId.eraserService).toHaveBeenCalled();
    });

    it('should return line when l is press on keyboard ', () => {
        const pressL = new KeyboardEvent('keypress', { key: 'l' });
        component.onKeyUp(pressL);
        expect(drawingToolId.lineService).toHaveBeenCalled();
    });

    it('should return rectangle when 1 is press on keyboard ', () => {
        const press1 = new KeyboardEvent('keypress', { key: '1' });
        component.onKeyUp(press1);
        expect(drawingToolId.rectangleService).toHaveBeenCalled();
    });
    it('should return ellipse when 2 is press on keyboard ', () => {
        const press2 = new KeyboardEvent('keypress', { key: '2' });
        component.onKeyUp(press2);
        expect(drawingToolId.ellipseService).toHaveBeenCalled();
    });
});
