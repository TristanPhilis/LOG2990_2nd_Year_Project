import { Component, AfterViewInit } from '@angular/core';
// import {MatButtonModule} from '@angular/material/button';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const CURRENT_DRAWINGS_SIZE = 3;
@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements AfterViewInit {
    drawingsInfo: BehaviorSubject<DrawingInfo[]>;
    drawingCounter: number;
    currentDrawings: BehaviorSubject<DrawingInfo[]>;
    constructor(private basicService: IndexService) {
        this.drawingCounter = 0;
        this.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
        this.currentDrawings = new BehaviorSubject<DrawingInfo[]>([]);
        this.getAllDrawings();
    }
    ngAfterViewInit(): void {
        this.updateCurrentDrawings();
    }

    updateCurrentDrawings() {
        if (this.drawingsInfo.value.length >= CURRENT_DRAWINGS_SIZE) {
            for (let i = 0; i < CURRENT_DRAWINGS_SIZE; i++) {
          const drawing: DrawingInfo = this.drawingsInfo.value[this.getDrawingPosition(this.drawingCounter - 1 + i)];
                this.currentDrawings.value[i] = drawing;
                this.currentDrawings.next(this.currentDrawings.value);
            }
        } else {
          this.currentDrawings.value[0] = this.drawingsInfo.value[0];
            if (this.drawingsInfo.value.length === CURRENT_DRAWINGS_SIZE - 1) {
              this.currentDrawings.value[1] = this.drawingsInfo.value[1];
                this.currentDrawings.next(this.currentDrawings.value);
            }
        }
    }
    sendDrawing(): void {
        const newDrawing: DrawingInfo = {
            id: 6,
            name: 'drawing1',
            tags: ['a'],
            metadata: '',
        };
        /*if (this.basicService.postDrawing(newDrawing) !== undefined)*/ this.basicService.postDrawing(newDrawing).subscribe();
        this.drawingsInfo.value.push(newDrawing);
    }

    getAllDrawings(): void {
        if (this.basicService.getAllDrawings() !== undefined) {
            this.basicService
                .getAllDrawings()
                .pipe(
                    map((drawingInfo: DrawingInfo[]) => {
                        return drawingInfo;
                    }),
                )
                .subscribe(this.drawingsInfo);
        }

        // console.log(this.drawingsInfo);
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
      this.updateCurrentDrawings();
        if (this.basicService.deleteDrawing(drawingId) !== undefined)
            this.basicService.deleteDrawing(drawingId).subscribe((drawingId: number) => {
                for (const drawingInfo of this.drawingsInfo.value) {
                    if (drawingInfo.id === drawingId) {
                        const index = this.drawingsInfo.value.indexOf(drawingInfo);
                        this.drawingsInfo.value.splice(index, 1);
                    }
                }
                // console.log(reponse);
            });
        this.getAllDrawings();
        this.updateCurrentDrawings();
    }

    getDrawingPosition(counter: number): number {
        let position = counter % this.drawingsInfo.value.length;
        if (position < 0) {
            position += this.drawingsInfo.value.length;
            position = position % this.drawingsInfo.value.length;
        }
        return position;
    }
}
