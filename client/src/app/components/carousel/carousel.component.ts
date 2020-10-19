import { Component, OnInit } from '@angular/core';
// import {MatButtonModule} from '@angular/material/button';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
    drawingsInfo: BehaviorSubject<DrawingInfo[]>;
    drawingCounter: number;
    constructor(private basicService: IndexService) {
        this.drawingCounter = 0;
        this.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
    }
    ngOnInit(): void {}

    sendDrawing(): void {
        const newDrawing: DrawingInfo = {
            id: 6,
            name: 'drawing1',
            tags: ['a'],
            metadata: '',
        };
        if (this.basicService.postDrawing(newDrawing) !== undefined) this.basicService.postDrawing(newDrawing).subscribe();
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
        console.log(this.drawingsInfo);
    }

    goToPreviousDrawing(): void {
        if (this.drawingCounter === 0) {
            this.drawingCounter = this.drawingsInfo.value.length - 1;
        } else {
            this.drawingCounter--;
        }
    }

    goToNextDrawing(): void {
        if (this.drawingCounter === this.drawingsInfo.value.length - 1) {
            this.drawingCounter = 0;
        } else {
            this.drawingCounter++;
        }
    }

    deleteDrawing(drawingId: number): void {
        if (this.basicService.deleteDrawing(drawingId) !== undefined) this.basicService.deleteDrawing(drawingId).subscribe((reponse: any)=> {
          console.log(reponse);
        });
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
