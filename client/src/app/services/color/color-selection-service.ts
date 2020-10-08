import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorSelection } from '@app/shared/enum';

const MAX_HISTORY_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class ColorSelectionService {
    primaryColor: Color;
    secondaryColor: Color;
    selectedColor: ColorSelection;
    showColorPicker: boolean;
    private colorsHistory: Color[];

    constructor() {
        this.colorsHistory = new Array(MAX_HISTORY_SIZE);
        const blackColor = new Color(0, 0, 0);
        this.primaryColor = blackColor;
        this.secondaryColor = blackColor;
        for (let index = 0; index < this.colorsHistory.length; index++) {
            this.colorsHistory[index] = blackColor;
        }
    }

    getcolorsHistory(): Color[] {
        return this.colorsHistory;
    }

    updateHistory(color: Color): void {
        const colorIndex = this.findColorInHistory(color);
        if (colorIndex < 0) {
            this.colorsHistory.shift();
        } else {
            this.colorsHistory.splice(colorIndex, 1);
        }
        this.colorsHistory.push(color);
    }

    private findColorInHistory(color: Color): number {
        const colorEqual = (element: Color) => element.hex === color.hex;
        return this.colorsHistory.findIndex(colorEqual);
    }

    swap(): void {
        const temp = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temp;
    }

    selectNewColor(color: Color): void {
        if (this.selectedColor === ColorSelection.primary) {
            this.primaryColor = color;
        } else {
            this.secondaryColor = color;
        }
    }
}
