import { AfterViewChecked, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { CarouselService } from '@app/services/carousel/carousel-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingInfo } from '@common/communication/drawing-info';
@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, AfterViewChecked {
    private noDrawings: boolean;
    displayedMessage: string;
    constructor(private drawingService: DrawingService, public carouselService: CarouselService, private dialog: MatDialog) {
        this.carouselService.getAllDrawings();
    }

    ngOnInit(): void {
        this.carouselService.tags = [];
    }

    ngAfterViewChecked(): void {
        this.noDrawings = this.carouselService.drawingsInfo?.value.length === 0;
        this.displayedMessage = this.noDrawings ? "Il n'y a presentement aucun dessin" : 'Aucun dessin ne correspond a votre recherche';
    }

    @HostListener('window: keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') this.goToPreviousDrawing();
        if (event.key === 'ArrowRight') this.goToNextDrawing();
    }

    addTag(): void {
        this.carouselService.addTag();
    }

    deleteTag(tag: string): void {
        this.carouselService.deleteTag(tag);
    }

    deleteDrawing(id: number): void {
        this.carouselService.deleteDrawing(id);
    }

    getDrawingPosition(counter: number): number {
        if (this.carouselService.tags.length === 0) return this.carouselService.getDrawingPosition(counter, this.carouselService.drawingsInfo.value);
        else return this.carouselService.getDrawingPosition(counter, this.carouselService.filteredDrawings);
    }

    goToPreviousDrawing(): void {
        this.carouselService.goToPreviousDrawing();
    }

    goToNextDrawing(): void {
        this.carouselService.goToNextDrawing();
    }

    loadDrawing(drawing: DrawingInfo): void {
        const newDrawingRef = this.dialog.open(CreateNewDrawingComponent);
        const subs = newDrawingRef.afterClosed().subscribe((result) => {
            this.sendDrawingToEditor(result, drawing);
        });
        subs.unsubscribe();
    }
    // tslint:disable-next-line: no-any Here result is of unknown type
    private sendDrawingToEditor(result: any, drawing: DrawingInfo): void {
        if (result) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.sendDrawing(drawing.metadata);

            this.drawingService.loadDrawing(this.drawingService.baseCtx);
        } else {
            this.dialog.open(CarouselComponent);
        }
    }
}
