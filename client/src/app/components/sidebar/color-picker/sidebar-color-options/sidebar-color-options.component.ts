import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Color } from '@app/classes/color';
import { ColorPickerComponent } from '@app/components/sidebar//color-picker/color-picker.component';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { PERCENT_MULTIPLIER } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Component({
    selector: 'app-sidebar-color-options',
    templateUrl: './sidebar-color-options.component.html',
    styleUrls: ['./sidebar-color-options.component.scss'],
})
export class SidebarColorOptionsComponent {
    constructor(private colorSelectionService: ColorSelectionService, private dialog: MatDialog, private shortcutService: ShortcutService) {}
    private isPrimaryColorOpened: boolean;

    @HostListener('contextmenu', ['$event'])
    disableContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    swap(): void {
        this.colorSelectionService.swap();
    }

    onAlphaChange(value: number, isPrimaryColor: boolean): void {
        const newAlpha = value * PERCENT_MULTIPLIER;
        const newColor = isPrimaryColor
            ? new Color(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b, newAlpha)
            : new Color(this.secondaryColor.r, this.secondaryColor.g, this.secondaryColor.b, newAlpha);
        this.colorSelectionService.selectNewColor(newColor, isPrimaryColor);
    }

    onHistoryColorSelected(event: MouseEvent, color: Color): void {
        this.colorSelectionService.updateHistory(color);
        const changePrimaryColor = event.buttons === MouseButton.Left;
        this.colorSelectionService.selectNewColor(color, changePrimaryColor);
    }

    openColorPicker(isPrimaryColor: boolean): void {
        this.isPrimaryColorOpened = isPrimaryColor;
        this.shortcutService.shortcutsEnabled = false;
        const colorPickerRef = this.dialog.open(ColorPickerComponent, {
            data: { colorHistory: this.colorHistory, isPrimaryColor },
        });

        colorPickerRef.afterClosed().subscribe((color?: Color) => {
            if (color) {
                this.colorSelectionService.updateHistory(color);
                this.colorSelectionService.selectNewColor(color, this.isPrimaryColorOpened);
            }
            this.isPrimaryColorOpened = false;
            this.shortcutService.shortcutsEnabled = true;
        });
    }

    get colorHistory(): Color[] {
        return this.colorSelectionService.getColorsHistory();
    }

    get primaryColor(): Color {
        return this.colorSelectionService.primaryColor;
    }

    get secondaryColor(): Color {
        return this.colorSelectionService.secondaryColor;
    }
}
