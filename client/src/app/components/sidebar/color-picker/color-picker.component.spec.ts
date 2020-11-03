import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Color } from '@app/classes/color-service';
import { ValidatorService } from '@app/services/validator-service';
import { MockComponents } from 'ng-mocks';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker.component';
import { ColorSliderComponent } from './color-slider/color-slider.component';

// tslint:disable:no-any
describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let validatorServiceSpy: jasmine.SpyObj<ValidatorService>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<ColorPickerComponent>>;

    beforeEach(async(() => {
        validatorServiceSpy = jasmine.createSpyObj('ValidatorService', ['isNumber', 'isValidHexColor']);
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef<ColorPickerComponent>', ['close']);
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent, MockComponents(ColorSliderComponent, ColorPaletteComponent)],
            imports: [FormsModule, ReactiveFormsModule, MatDialogModule],
            providers: [
                { provide: ValidatorService, usevalue: validatorServiceSpy },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: [] },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('color should default to white and form subscription should be added on initialization', () => {
        const subscriptionSpy = spyOn<any>(component, 'addFormsValueChangesBehaviour');
        component.ngOnInit();
        expect(component.color).toEqual(new Color(0, 0, 0));
        expect(subscriptionSpy).toHaveBeenCalled();
    });

    it('Update color should change the current color and update the form', () => {
        const updateColorFormSpy = spyOn<any>(component, 'updateColorForm');
        const expectedColor = new Color(2, 2, 2);
        component.updateColor(expectedColor);
        expect(component.color).toEqual(expectedColor);
        expect(updateColorFormSpy).toHaveBeenCalled();
    });

    it('onSelect with a valid color should close this dialog', () => {
        component.colorForm.setValue({
            r: 1,
            g: 1,
            b: 1,
            hex: 1,
        });
        component.onSelect();
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('onSelect with a invalid color should close this dialog', () => {
        component.colorForm.setValue({
            r: 1,
            g: 1,
            b: 1,
            hex: 'w',
        });
        component.onSelect();
        expect(matDialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('Changing red form value should not change the color if invalid', () => {
        const updateColorSpy = spyOn<any>(component, 'updateColor');
        component.colorForm.patchValue({
            r: 1,
        });
        expect(updateColorSpy).toHaveBeenCalled();
    });

    it('Changing red form value should not change the color if invalid', () => {
        const invalidValue = -1;
        const updateColorSpy = spyOn<any>(component, 'updateColor');
        component.colorForm.patchValue({
            r: invalidValue,
        });
        expect(updateColorSpy).not.toHaveBeenCalled();
    });

    it('Changing blue form value should not change the color if invalid', () => {
        const updateColorSpy = spyOn<any>(component, 'updateColor');
        component.colorForm.patchValue({
            b: 1,
        });
        expect(updateColorSpy).toHaveBeenCalled();
    });

    it('Changing blue form value should not change the color if invalid', () => {
        const invalidValue = -1;
        const updateColorSpy = spyOn<any>(component, 'updateColor');
        component.colorForm.patchValue({
            b: invalidValue,
        });
        expect(updateColorSpy).not.toHaveBeenCalled();
    });

    it('Changing green form value should not change the color if invalid', () => {
        const updateColorSpy = spyOn<any>(component, 'updateColor');
        component.colorForm.patchValue({
            g: 1,
        });
        expect(updateColorSpy).toHaveBeenCalled();
    });

    it('Changing green form value should not change the color if invalid', () => {
        const invalidValue = -1;
        const updateColorSpy = spyOn<any>(component, 'updateColor');
        component.colorForm.patchValue({
            g: invalidValue,
        });
        expect(updateColorSpy).not.toHaveBeenCalled();
    });

    it('failing form does not crash the app', () => {
        component.colorForm.controls = {};
        component.ngOnInit();
        expect(component.colorForm).toBeTruthy();
    });
});
