import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Color, MAX_RBG_VALUE } from '@app/classes/color';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { ValidatorService } from '@app/services/validator-service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
    hue: Color;
    color: Color;
    colorForm: FormGroup = this.fb.group({
        r: ['', [Validators.required, Validators.min(0), Validators.max(MAX_RBG_VALUE), this.validatorService.isNumber()]],
        g: ['', [Validators.required, Validators.min(0), Validators.max(MAX_RBG_VALUE), this.validatorService.isNumber()]],
        b: ['', [Validators.required, Validators.min(0), Validators.max(MAX_RBG_VALUE), this.validatorService.isNumber()]],
        hex: ['', [this.validatorService.isValidHexColor()]],
    });

    constructor(private fb: FormBuilder, private colorSelectionService: ColorSelectionService, private validatorService: ValidatorService) {
        //
    }

    ngOnInit(): void {
        this.addFormsValueChangesBehaviour();
    }

    addFormsValueChangesBehaviour(): void {
        this.colorForm.get('r')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('r')?.valid) {
                const newColor = new Color(newValue, this.color.g, this.color.b);
                this.updateColor(newColor);
            }
        });

        this.colorForm.get('g')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('g')?.valid) {
                const newColor = new Color(this.color.r, newValue, this.color.b);
                this.updateColor(newColor);
            }
        });

        this.colorForm.get('b')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('b')?.valid) {
                const newColor = new Color(this.color.r, this.color.g, newValue);
                this.updateColor(newColor);
            }
        });

        this.colorForm.get('hex')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('hex')?.valid) {
                const newColor = new Color(0, 0, 0);
                newColor.setHex(parseInt(newValue, 16));
                this.color = newColor;
                this.updateColorForm(true);
            }
        });
    }

    updateColorForm(fromHexFormControlChange: boolean): void {
        this.colorForm.setValue(
            {
                r: this.color.r,
                g: this.color.g,
                b: this.color.b,
                hex: fromHexFormControlChange ? this.color.stripedHexString : this.color.hexString,
            },
            { emitEvent: false },
        );
    }

    updateColor(color: Color): void {
        this.color = color;
        this.updateColorForm(false);
    }

    onSelect(): void {
        if (this.colorForm.valid) {
            this.colorSelectionService.updateHistory(this.color);
            this.colorSelectionService.selectNewColor(this.color);
            this.colorSelectionService.showColorPicker = false;
        } else {
            alert('Select a valid color');
        }
    }

    onCancel(): void {
        this.colorSelectionService.showColorPicker = false;
    }

    get colorHistory(): Color[] {
        return this.colorSelectionService.getcolorsHistory();
    }
}
