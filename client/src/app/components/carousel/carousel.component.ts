import { AfterViewChecked, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { Router } from '@angular/router';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingsDataService } from '@app/services/index/drawings-data.service';
import { DrawingInfo } from '@common/communication/drawing-info';
@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, AfterViewChecked {
    noDrawingFiltered: boolean;
    noDrawings: boolean;
    displayedMessage: string;
    constructor(private drawingService: DrawingService, public drawingsDataService: DrawingsDataService, private dialog: MatDialog) {
        this.drawingsDataService.getAllDrawings();
    }

    ngOnInit(): void {
        this.drawingsDataService.tags = [];
    }

    ngAfterViewChecked(): void {
        this.noDrawings = this.drawingsDataService.drawingsInfo?.value.length === 0;
        this.noDrawingFiltered = this.drawingsDataService.filteredDrawings?.length === 0;
        if (this.noDrawings) this.displayedMessage = "Il n'y a présentement aucun dessin";
        else this.displayedMessage = 'Aucun dessin ne correspond a votre recherche';
    }

    @HostListener('window: keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') this.goToPreviousDrawing();
        if (event.key === 'ArrowRight') this.goToNextDrawing();
    }

    addTag(): void {
        this.drawingsDataService.addTag();
    }

    deleteTag(tag: string): void {
        this.drawingsDataService.deleteTag(tag);
    }

    deleteDrawing(id: number): void {
        this.drawingsDataService.deleteDrawing(id);
    }

    getDrawingPosition(counter: number): number {
        if (this.drawingsDataService.tags.length === 0)
            return this.drawingsDataService.getDrawingPosition(counter, this.drawingsDataService.drawingsInfo.value);
        else return this.drawingsDataService.getDrawingPosition(counter, this.drawingsDataService.filteredDrawings);
    }

    goToPreviousDrawing(): void {
        this.drawingsDataService.goToPreviousDrawing();
    }

    goToNextDrawing(): void {
        this.drawingsDataService.goToNextDrawing();
    }

    loadDrawing(drawing: DrawingInfo): void {
        const newDrawingRef = this.dialog.open(CreateNewDrawingComponent);
        newDrawingRef.afterClosed().subscribe((result) => {
            this.sendDrawingToEditor(result, drawing);
        });
    }
    // tslint:disable-next-line: no-any Here result is of unknown type
    sendDrawingToEditor(result: any, drawing: DrawingInfo): void {
        if (result) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.sendDrawing(drawing.metadata);

            this.drawingService.loadDrawing(this.drawingService.baseCtx);
        } else {
            const carouselRef = this.dialog.open(CarouselComponent);
            carouselRef.afterClosed().subscribe();
        }
    }
}
