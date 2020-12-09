import { Component, ElementRef, ViewChild } from '@angular/core';
import { GridService } from '@app/services/grid/grid-service';
import { AnchorsPosition } from '@app/shared/enum';

const ACTIVATE = 'Activer';
const DEACTIVATE = 'Désactiver';

@Component({
    selector: 'app-magnet-option',
    templateUrl: './magnet-option.component.html',
    styleUrls: ['./magnet-option.component.scss'],
})
export class MagnetOptionComponent {
    @ViewChild('anchorsContainer', { static: false }) anchorsContainer: ElementRef<HTMLDivElement>;
    currentSelectedAnchor: HTMLDivElement;
    constructor(private gridService: GridService) {}

    toggleMagnetism(): void {
        this.gridService.toggleMagnetism();
    }

    onAnchorClick(anchorElement: HTMLDivElement, anchorPosition: AnchorsPosition): void {
        this.removeSelectedStyle();
        anchorElement.classList.add('selected');
        this.gridService.setAnchor(anchorPosition);
        this.currentSelectedAnchor = anchorElement;
    }

    removeSelectedStyle(): void {
        this.anchorsContainer.nativeElement.childNodes.forEach((element: HTMLDivElement) => {
            if (element.classList.contains('selected')) {
                element.classList.remove('selected');
            }
        });
    }

    get isMagnetismActivated(): boolean {
        return this.gridService.shouldSnapToGrid;
    }

    get buttonText(): string {
        return this.isMagnetismActivated ? DEACTIVATE : ACTIVATE;
    }

    get AnchorsPosition(): typeof AnchorsPosition {
        return AnchorsPosition;
    }
}
