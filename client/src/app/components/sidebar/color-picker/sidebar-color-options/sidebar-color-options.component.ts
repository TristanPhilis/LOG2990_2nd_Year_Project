import { Component } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { ColorSelection, MouseButton } from '@app/shared/enum';

@Component({
    selector: 'app-sidebar-color-options',
    templateUrl: './sidebar-color-options.component.html',
    styleUrls: ['./sidebar-color-options.component.scss'],
})
export class SidebarColorOptionsComponent {
    constructor(private colorSelectionService: ColorSelectionService) {}

    swap(): void {
        this.colorSelectionService.swap();
    }

    // need any to acces target.valueAsNumber
    // tslint:disable-next-line:no-any
    onAlphaChange(event: any, colorSelected: ColorSelection): void {
        const precentageMultiplier = 0.01;
        const newAlpha = event.target.valueAsNumber * precentageMultiplier;
        console.log(newAlpha);
        if (colorSelected === ColorSelection.primary) {
            const newColor = new Color(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b, newAlpha);
            this.colorSelectionService.primaryColor = newColor;
        } else {
            const newColor = new Color(this.secondaryColor.r, this.secondaryColor.g, this.secondaryColor.b, newAlpha);
            this.colorSelectionService.secondaryColor = newColor;
        }
    }

    onHistoryColorSelected(event: MouseEvent, color: Color): void {
        console.log(event);
        this.colorSelectionService.updateHistory(color);
        if (event.buttons === MouseButton.Left) {
            this.colorSelectionService.primaryColor = color;
        } else if (event.buttons === MouseButton.Right) {
            this.colorSelectionService.secondaryColor = color;
        }
    }

    openColorPicker(colorSelected: ColorSelection): void {
        this.colorSelectionService.selectedColor = colorSelected;
        this.colorSelectionService.showColorPicker = true;
    }

    get colorHistory(): Color[] {
        return this.colorSelectionService.getcolorsHistory();
    }

    get primaryColor(): Color {
        return this.colorSelectionService.primaryColor;
    }

    get secondaryColor(): Color {
        return this.colorSelectionService.secondaryColor;
    }

    get showColorPicker(): boolean {
        return this.colorSelectionService.showColorPicker;
    }
}
