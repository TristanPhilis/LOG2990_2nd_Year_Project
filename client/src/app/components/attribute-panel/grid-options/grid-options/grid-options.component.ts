import { Component } from '@angular/core';
import { GridService } from '@app/services/grid/grid-service';
import { PERCENT_MULTIPLIER } from '@app/shared/constant';

const REMOVE = 'Enlever';
const SHOW = 'Afficher';

@Component({
    selector: 'app-grid-options',
    templateUrl: './grid-options.component.html',
    styleUrls: ['./grid-options.component.scss'],
})
export class GridOptionsComponent {
    constructor(public gridService: GridService) {}

    updateSize(value: number): void {
        this.gridService.squareSize = value;
        this.gridService.onOptionChange();
    }

    updateTransparency(value: number): void {
        this.gridService.transparency = value * PERCENT_MULTIPLIER;
        this.gridService.onOptionChange();
    }

    formatSize(value: number): string {
        return value + 'px';
    }

    formatTransparency(value: number): string {
        return value + '%';
    }

    toggleGrid(): void {
        this.gridService.toggleGrid();
    }

    get buttonText(): string {
        return this.gridService.isShown ? REMOVE : SHOW;
    }
}
