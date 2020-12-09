import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
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
        this.drawingService.fillCanvas('white');
        (this.drawingService as DrawingService).autoSave();
    }

    openGuide(): void {
        this.dialog.open(GuideComponent);
    }

    openCarousel(): void {
        this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });
    }

    continueDrawing(): void {
        const newDrawingRef = this.dialog.open(CreateNewDrawingComponent);
        newDrawingRef.afterClosed().subscribe((result) => {
            this.sendDrawingToEditor(result);
        });
    }

    // tslint:disable-next-line: no-any Result is of any type
    sendDrawingToEditor(result: any): void {
        if (result) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.fillCanvas('white');
            this.drawingService.sendDrawing(localStorage.getItem(this.drawingService.lastDrawingKey) || '{}');

            this.drawingService.loadDrawing(this.drawingService.baseCtx);
        }
    }
}
