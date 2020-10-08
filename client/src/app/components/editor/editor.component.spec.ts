import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AttributePanelComponent } from '@app/components/attribute-panel/attribute-panel.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { MIN_CANVAS_SIZE } from '@app/shared/constant';
import { MockComponents } from 'ng-mocks';
import { EditorComponent } from './editor.component';

// tslint:disable:no-any
// from karma-viewport library, needs to be declared so ts recognises it
declare const viewport: any;

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let mouseEvent: MouseEvent;
    let setAnchorSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserModule, BrowserAnimationsModule],
            declarations: [EditorComponent, MockComponents(SidebarComponent, AttributePanelComponent, DrawingComponent)],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        setAnchorSpy = spyOn<any>(component, 'setAnchorPosition').and.callThrough();

        const significantOffset = 600;
        mouseEvent = {
            x: significantOffset,
            y: significantOffset,
            buttons: 1,
        } as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set anchor position on initialisation', () => {
        component.ngAfterViewInit();
        expect(setAnchorSpy).toHaveBeenCalled();
    });

    it('should initialise with canvas minimum size of 250', () => {
        const smallScreenSize = 400;
        viewport.set(smallScreenSize, smallScreenSize);
        component.ngAfterViewInit();
        expect(component.canvasSize.x).toEqual(MIN_CANVAS_SIZE);
        expect(component.canvasSize.y).toEqual(MIN_CANVAS_SIZE);
        viewport.reset();
    });

    it('onMouseDown should not set mouseDown to true if not left click', () => {
        mouseEvent = { buttons: 3 } as MouseEvent;
        component.onMouseDown(mouseEvent, 0);
        expect(component.mouseDown).toBeFalse();
    });

    it('onMouseDown with right anchor should set mouseDown and right resize values', () => {
        component.onMouseDown(mouseEvent, 0);
        expect(component.mouseDown).toBeTrue();
        expect(component.resizeX).toBeFalse();
        expect(component.resizeY).toBeTrue();
    });

    it('onMouseDown with bottom anchor should set mouseDown and right resize values', () => {
        component.onMouseDown(mouseEvent, 1);
        expect(component.mouseDown).toBeTrue();
        expect(component.resizeX).toBeTrue();
        expect(component.resizeY).toBeFalse();
    });

    it('onMouseDown with corner anchor should set mouseDown and right resize values', () => {
        component.onMouseDown(mouseEvent, 2);
        expect(component.mouseDown).toBeTrue();
        expect(component.resizeX).toBeTrue();
        expect(component.resizeY).toBeTrue();
    });

    it('onMouseMove and onMouseUp should do nothing when mouseDown is false', () => {
        component.mouseDown = false;
        component.canvasSize = { x: 0, y: 0 };
        component.previewSize = { x: 1, y: 1 };
        component.onMouseMove(mouseEvent);
        component.onMouseUp(mouseEvent);
        expect(setAnchorSpy).not.toHaveBeenCalled();
        expect(component.canvasSize).not.toEqual(component.previewSize);
    });

    it('onMouseUp should set the canvas size when mouseDOwn is true', () => {
        component.mouseDown = true;
        component.canvasSize = { x: 0, y: 0 };
        component.previewSize = { x: 1, y: 1 };
        component.onMouseUp(mouseEvent);
        expect(component.canvasSize).toEqual(component.previewSize);
    });

    it('onMouseMove should change preview.x when resize X is true', () => {
        component.mouseDown = true;
        component.resizeX = true;
        component.previewSize = { x: 0, y: 0 };
        component.onMouseMove(mouseEvent);
        expect(component.previewSize.x).not.toEqual(0);
        expect(component.previewSize.y).toEqual(0);
    });

    it('onMouseMove should change preview.y when resize y is true', () => {
        component.mouseDown = true;
        component.resizeY = true;
        component.previewSize = { x: 0, y: 0 };
        component.onMouseMove(mouseEvent);
        expect(component.previewSize.y).not.toEqual(0);
        expect(component.previewSize.x).toEqual(0);
    });

    it('onMouseMove should change preview.x and y when resize x and y is true and let minimum size be 250', () => {
        component.mouseDown = true;
        component.resizeY = true;
        component.resizeX = true;
        component.previewSize = { x: 0, y: 0 };
        mouseEvent = { x: 0, y: 0, buttons: 1 } as MouseEvent;

        component.onMouseMove(mouseEvent);
        expect(component.previewSize.y).toEqual(MIN_CANVAS_SIZE);
        expect(component.previewSize.x).toEqual(MIN_CANVAS_SIZE);
    });
});
