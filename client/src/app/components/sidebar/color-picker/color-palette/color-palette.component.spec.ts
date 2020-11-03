import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorPaletteComponent } from './color-palette.component';

// tslint:disable:no-any
describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    let mouseEvent: MouseEvent;
    let colorChangeSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        colorChangeSpy = spyOn(component.colorChange, 'emit');

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Clicking should emit a new color', () => {
        component.onMouseDown(mouseEvent);
        expect(colorChangeSpy).toHaveBeenCalled();
    });

    it('After clicking, should emit a new color when moving', () => {
        const expectedNumberOfCalls = 3;
        component.onMouseDown(mouseEvent);
        component.onMouseMove(mouseEvent);
        component.onMouseMove(mouseEvent);
        expect(colorChangeSpy).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('Should not emit if was not clicked', () => {
        component.onMouseMove(mouseEvent);
        component.onMouseDown(mouseEvent);
        component.onMouseUp();
        component.onMouseMove(mouseEvent);
        expect(colorChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit color on hue change', () => {
        const newColor = new Color(1, 1, 1);
        // tslint:disable-next-line:no-string-literal
        component['hue'] = newColor;
        // tslint:disable-next-line:no-string-literal
        component['mouseCoord'] = { x: 0, y: 0 };
        component.ngOnChanges({
            hue: new SimpleChange(null, newColor, false),
        });
        fixture.detectChanges();
        expect(colorChangeSpy).toHaveBeenCalled();
    });

    it('should not emit color on hue change if no mouseCoord or defined context', () => {
        const newColor = new Color(1, 1, 1);
        component.ngOnChanges({
            hue: new SimpleChange(null, newColor, false),
        });
        fixture.detectChanges();
        expect(colorChangeSpy).not.toHaveBeenCalled();

        // Assigning invalid context
        // tslint:disable-next-line:no-string-literal
        component['paletteCtx'] = component['paletteCanvas'].nativeElement.getContext('2D') as CanvasRenderingContext2D;
        component.ngOnChanges({
            hue: new SimpleChange(null, newColor, false),
        });
        fixture.detectChanges();
        expect(colorChangeSpy).not.toHaveBeenCalled();
    });
});
