import { Component, OnInit } from '@angular/core';
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
    constructor(private basicService: IndexService) {}

    drawingsInfo: BehaviorSubject<DrawingInfo[]> = new BehaviorSubject<DrawingInfo[]>([]);
    ngOnInit(): void {}

    sendDrawingToServer(): void {
        const newDrawing: DrawingInfo = {
            id: 6,
            name: 'era',
            tags: ['a'],
            metadata: '',
        };
        this.basicService.postDrawing(newDrawing).subscribe();
    }

    getDrawingInfo(): void {
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
        console.log(this.drawingsInfo.value.length);
    }
}
