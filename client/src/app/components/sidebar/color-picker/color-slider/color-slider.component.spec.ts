import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ColorSliderComponent } from './color-slider.component';

describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;
    let mouseEvent: MouseEvent;
    // tslint:disable-next-line:no-any
    let colorChangeSpy: jasmine.Spy<any>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ColorSliderComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        colorChangeSpy = spyOn(component.colorChange, 'emit');

        mouseEvent = {
            offsetX: 5,
            offsetY: 5,
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
});
