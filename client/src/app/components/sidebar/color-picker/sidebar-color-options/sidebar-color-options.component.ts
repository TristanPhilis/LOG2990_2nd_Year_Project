import { AfterViewInit, Component } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { MouseButton } from '@app/shared/enum';

@Component({
    selector: 'app-sidebar-color-options',
    templateUrl: './sidebar-color-options.component.html',
    styleUrls: ['./sidebar-color-options.component.scss']
})
export class SidebarColorOptionsComponent implements AfterViewInit {

    constructor(private colorSelectionService: ColorSelectionService) { }

    ngAfterViewInit(): void {
    }

    swap(): void {
        this.colorSelectionService.swap();
    }

    onHistoryColorSelected(event: MouseEvent, color: Color): void {
        this.colorSelectionService.updateHistory(color);
        if (event.buttons === MouseButton.Left) {
            this.colorSelectionService.primaryColor = color;
        } else if (event.buttons === MouseButton.Right) {
            this.colorSelectionService.secondaryColor = color;
        }
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

}
