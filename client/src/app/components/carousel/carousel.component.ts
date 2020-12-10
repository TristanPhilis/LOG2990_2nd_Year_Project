import { AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
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
    constructor(
        private drawingService: DrawingService,
        public carouselService: CarouselService,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef,
    ) {
        this.carouselService.getAllDrawings();
    }

    ngOnInit(): void {
        this.carouselService.tags = [];
    }

    ngAfterViewChecked(): void {
        this.noDrawings = this.carouselService.drawingsInfo?.value?.length === 0;
        this.displayedMessage = this.noDrawings ? "Il n'y a presentement aucun dessin" : 'Aucun dessin ne correspond a votre recherche';
        this.cdRef.detectChanges();
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
        return this.carouselService.tags.length === 0
            ? this.carouselService.getDrawingPosition(counter, this.carouselService.drawingsInfo.value)
            : this.carouselService.getDrawingPosition(counter, this.carouselService.filteredDrawings);
    }

    goToPreviousDrawing(): void {
        this.carouselService.goToPreviousDrawing();
    }

    goToNextDrawing(): void {
        this.carouselService.goToNextDrawing();
    }

    loadDrawing(drawing: DrawingInfo): void {
        const newDrawingRef = this.dialog.open(CreateNewDrawingComponent);
        newDrawingRef?.afterClosed().subscribe((result) => {
            this.sendDrawingToEditor(result, drawing);
        });
    }
    private sendDrawingToEditor(result: boolean, drawing: DrawingInfo): void {
        if (result) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.sendDrawing(drawing.metadata);
            this.drawingService.loadDrawing(this.drawingService.baseCtx);
            this.drawingService.autoSave();
        } else {
            this.dialog.open(CarouselComponent);
        }
    }
}
