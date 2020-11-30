import { Injectable } from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class ValidatorService {
    isNumber(): ValidatorFn {
        return this.isNumberFunction;
    }

    isValidHexColor(): ValidatorFn {
        return this.isValidHexColorFunction;
    }

    isValidTag(): ValidatorFn {
        return this.isValidTagFunction;
    }

    // Course note extract
    /**
     * Validate that form input is a number (Extrait note de cour)
     * @param control the form control to validate
     * @returns null if valid, object  if invalid
     */
    private isNumberFunction(control: FormControl): { [key: string]: boolean } | null {
        if (!control.value || isNaN(control.value)) {
            return { input: control.value };
        }
        return null;
    }

    private isValidHexColorFunction(control: FormControl): { [key: string]: boolean } | null {
        const regEx = /^[\da-fA-F]{1,6}$/;
        if (regEx.test(control.value)) {
            return null;
        } else {
            return { input: control.value };
        }
    }

    private isValidTagFunction(control: FormControl): { [key: string]: boolean } | null {
        const regEx = /^[a-z][a-z0-9]{0,4}$/i;
        if (regEx.test(control.value)) {
            return null;
        } else {
            return { input: control.value };
        }
    }
}
