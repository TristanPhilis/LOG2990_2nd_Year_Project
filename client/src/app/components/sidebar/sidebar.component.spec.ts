import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GuideComponent } from '@app/components/guide/guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { DrawingToolId, SidebarToolID } from '@app/shared/enum';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';

// tslint:disable:no-any
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let getComposedKeySpy: jasmine.Spy<any>;
    let keyEvent: KeyboardEvent;
    let toolsService: ToolsService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<GuideComponent, any>>;

    beforeEach(
        waitForAsync(() => {
            dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
            dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
            dialogSpy.open.and.returnValue(dialogRefSpyObj);
            drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
            TestBed.configureTestingModule({
                imports: [MatDialogModule, BrowserModule, BrowserAnimationsModule],
                declarations: [SidebarComponent],
                providers: [
                    { provide: DrawingService, useValue: drawServiceSpy },
                    { provide: MatDialog, useValue: dialogSpy },
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

    it('onKeyDown should call getComposedKey()', () => {
        keyEvent = { ctrlKey: true, key: 'h' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(getComposedKeySpy).toHaveBeenCalled();
    });

    it('onKeyDown should clear Canvas', () => {
        keyEvent = { ctrlKey: true, key: 'o' } as KeyboardEvent;
        component.onKeyDown(keyEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onButtonPressBottom should set openGuide', () => {
        component.onButtonPressBottom(SidebarToolID.openGuide);
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should return pencil when c is press on keyboard ', () => {
        const pressC = new KeyboardEvent('keypress', { key: 'c' });
        component.onKeyUp(pressC);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.pencilService);
    });

    it('should return erase when e is press on keyboard ', () => {
        const pressE = new KeyboardEvent('keypress', { key: 'e' });
        component.onKeyUp(pressE);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.eraserService);
    });

    it('should return line when l is press on keyboard ', () => {
        const pressL = new KeyboardEvent('keypress', { key: 'l' });
        component.onKeyUp(pressL);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.lineService);
    });

    it('should return rectangle when 1 is press on keyboard ', () => {
        const press1 = new KeyboardEvent('keypress', { key: '1' });
        component.onKeyUp(press1);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.rectangleService);
    });
    it('should return ellipse when 2 is press on keyboard ', () => {
        const press2 = new KeyboardEvent('keypress', { key: '2' });
        component.onKeyUp(press2);
        expect(toolsService.currentDrawingToolID).toEqual(DrawingToolId.ellipseService);
    });
});
