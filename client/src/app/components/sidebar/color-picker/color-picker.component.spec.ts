import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidatorService } from '@app/services/validator-service';
import { MockComponents } from 'ng-mocks';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker.component';
import { ColorSliderComponent } from './color-slider/color-slider.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let validatorServiceSpy: jasmine.SpyObj<ValidatorService>;

    beforeEach(async(() => {
        validatorServiceSpy = jasmine.createSpyObj('ValidatorService', ['isNumber', 'isValidHexColor']);
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent, MockComponents(ColorSliderComponent, ColorPaletteComponent)],
            providers: [{ provide: ValidatorService, usevalue: validatorServiceSpy }],
            imports: [FormsModule, ReactiveFormsModule],
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
});
