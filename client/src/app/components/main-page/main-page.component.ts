import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { GuideComponent } from '@app/components/guide/guide.component';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    canContinueDrawing: boolean;
    constructor(public dialog: MatDialog, private drawingService: DrawingService) {
        this.canContinueDrawing = localStorage.getItem(this.drawingService.lastDrawingKey) !== '';
    }

    createNew(): void {
        this.drawingService.drawingToLoad = '';
    }

    openGuide(): void {
        this.dialog.open(GuideComponent);
    }

    openCarousel(): void {
        this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });
    }

    // tslint:disable-next-line: no-any Result is of any type
    continueDrawing(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.fillCanvas('white');
        this.drawingService.sendDrawing(localStorage.getItem(this.drawingService.lastDrawingKey) || '{}');
    }
}
