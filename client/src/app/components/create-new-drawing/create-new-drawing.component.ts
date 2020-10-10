import { Component, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-create-new-drawing',
    templateUrl: './create-new-drawing.component.html',
    styleUrls: ['./create-new-drawing.component.scss'],
})
export class CreateNewDrawingComponent implements OnInit {
    constructor(private drawingService: DrawingService) {}

    ngOnInit(): void {}

    clearCanvas(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }
}
