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
        this.drawingCounter = 1;
        this.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
    }
    ngOnInit(): void {}

    sendDrawingToServer(): void {
        const newDrawing: DrawingInfo = {
            id: 6,
            name: 'era',
            tags: ['a'],
            metadata: '',
        };
        this.basicService.postDrawing(newDrawing).subscribe();
        this.getAllDrawings();
    }

    async getAllDrawings(): Promise<void> {
        this.basicService
            .getDrawing()
            // Cette étape transforme le Message en un seul string
            .pipe(
                map((drawingInfo: DrawingInfo[]) => {
                    // return `${drawingInfo.name} ${drawingInfo.tags}`;
                    // this.drawingInfo.next(drawingInfo);
                    return drawingInfo;
                }),
            )
            .subscribe(this.drawingsInfo);
    }

    getPreviousDrawing(): void {
        if (this.drawingCounter > 0) this.drawingCounter--;
    }

    getNextDrawing(): void {
        if (this.drawingCounter < this.drawingsInfo.value.length - 1) this.drawingCounter++;
    }

    deleteDrawing(drawingId: number): void {
      this.basicService.deleteDrawing(drawingId).subscribe();
      this.getAllDrawings();
    }
}
