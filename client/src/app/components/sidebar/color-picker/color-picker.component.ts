import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { ValidatorService } from '@app/services/validator-service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
    hue: Color;
    color: Color;
    colorForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private validatorService: ValidatorService,
        public dialogRef: MatDialogRef<ColorPickerComponent>,
        @Inject(MAT_DIALOG_DATA) public colorHistory: Color[],
    ) {
        this.colorForm = this.fb.group({
            r: ['', [Validators.required, Validators.min(0), Validators.max(MAX_RGBA_VALUE), this.validatorService.isNumber()]],
            g: ['', [Validators.required, Validators.min(0), Validators.max(MAX_RGBA_VALUE), this.validatorService.isNumber()]],
            b: ['', [Validators.required, Validators.min(0), Validators.max(MAX_RGBA_VALUE), this.validatorService.isNumber()]],
            hex: ['', [this.validatorService.isValidHexColor()]],
        });
    }

    ngOnInit(): void {
        this.color = new Color(0, 0, 0);
        this.addFormsValueChangesBehaviour();
    }

    private addFormsValueChangesBehaviour(): void {
        let subs = this.colorForm.get('r')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('r')?.valid) {
                const newColor = new Color(newValue, this.color.g, this.color.b);
                this.updateColor(newColor);
            }
        });
        subs?.unsubscribe();

        subs = this.colorForm.get('g')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('g')?.valid) {
                const newColor = new Color(this.color.r, newValue, this.color.b);
                this.updateColor(newColor);
            }
        });
        subs?.unsubscribe();

        subs = this.colorForm.get('b')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('b')?.valid) {
                const newColor = new Color(this.color.r, this.color.g, newValue);
                this.updateColor(newColor);
            }
        });
        subs?.unsubscribe();

        subs = this.colorForm.get('hex')?.valueChanges.subscribe((newValue) => {
            if (this.colorForm.get('hex')?.valid) {
                const newColor = new Color(0, 0, 0);
                newColor.setHex(parseInt(newValue, 16));
                this.color = newColor;
                this.updateColorForm(true);
            }
        });
        subs?.unsubscribe();
    }

    private updateColorForm(fromHexFormControlChange: boolean): void {
        this.colorForm.setValue(
            {
                r: this.color.r,
                g: this.color.g,
                b: this.color.b,
                // When editing directly the hex value, we prevent showing the leading 0's
                // so the editing is more fluid. Otherwise, deleting a number would automaticaly shift everything
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
            this.dialogRef.close(this.color);
        } else {
            alert('Select a valid color');
        }
    }
}
