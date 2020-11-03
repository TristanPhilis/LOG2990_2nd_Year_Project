import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateNewDrawingComponent } from '@app/components/create-new-drawing/create-new-drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const CURRENT_DRAWINGS_MAX_SIZE = 3;
@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent {
    drawingsInfo: BehaviorSubject<DrawingInfo[]>;
    drawingCounter: number;
    currentDrawings: DrawingInfo[];
    constructor(private basicService: IndexService, private drawingService: DrawingService, private dialog: MatDialog, private router: Router) {
        this.drawingCounter = 0;
        this.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
        this.currentDrawings = [];
        this.getAllDrawings();
    }

    updateCurrentDrawings(): void {
        switch (this.drawingsInfo.value.length) {
            case 0:
                break;
            case 1:
                this.currentDrawings = [this.drawingsInfo.value[0]];
                break;
            case 2:
                this.currentDrawings = [
                    this.drawingsInfo.value[this.getDrawingPosition(this.drawingCounter - 1)],
                    this.drawingsInfo.value[this.getDrawingPosition(this.drawingCounter)],
                ];
                break;
            default:
                for (let i = 0; i < CURRENT_DRAWINGS_MAX_SIZE; i++) {
                    this.currentDrawings[i] = this.drawingsInfo.value[this.getDrawingPosition(this.drawingCounter - 1 + i)];
                }
                break;
        }
    }

    getAllDrawings(): void {
        this.basicService
            .getAllDrawings()
            .pipe(
                map((drawingInfo: DrawingInfo[]) => {
                    return drawingInfo;
                }),
            )
            .subscribe(
                (drawingsInfo) => {
                    this.drawingsInfo.next(drawingsInfo);
                },
                (error: Error) => {
                    throw error;
                },
                () => {
                    this.updateCurrentDrawings();
                },
            );
    }

    goToPreviousDrawing(): void {
        if (this.drawingCounter === 0) {
            this.drawingCounter = this.drawingsInfo.value.length - 1;
        } else {
            this.drawingCounter--;
        }
        this.updateCurrentDrawings();
    }

    goToNextDrawing(): void {
        if (this.drawingCounter === this.drawingsInfo.value.length - 1) {
            this.drawingCounter = 0;
        } else {
            this.drawingCounter++;
        }
        this.updateCurrentDrawings();
    }

    deleteDrawing(drawingId: number): void {
        this.basicService.deleteDrawing(drawingId)?.subscribe(
            (deletedDrawingId: number) => {
                for (const drawingInfo of this.drawingsInfo.value) {
                    if (drawingInfo.id === deletedDrawingId) {
                        const index = this.drawingsInfo.value.indexOf(drawingInfo);
                        this.drawingsInfo.value.splice(index, 1);
                    }
                }
            },
            () => {
                throw new Error('Error: Drawing does not exist');
            },
            () => {
                this.updateCurrentDrawings();
            },
        );
    }

    loadDrawing(drawing: DrawingInfo): void {
        const newDrawingRef = this.dialog.open(CreateNewDrawingComponent);
        newDrawingRef.afterClosed().subscribe((result) => {
            if (result) {
                this.drawingService.fillCanvas('white');
                this.drawingService.sendDrawing(drawing.metadata);
                this.router
                    .navigate(['/editor'])
                    .then(() => {
                        this.drawingService.loadDrawing(this.drawingService.baseCtx);
                    })
                    .catch();
            } else {
                const carouselRef = this.dialog.open(CarouselComponent);
                carouselRef.afterClosed().subscribe();
            }
        });
    }

    getDrawingPosition(counter: number): number {
        let position = counter % this.drawingsInfo.value.length;
        if (position < 0) {
            position += this.drawingsInfo.value.length;
        }
        return position;
    }
}
