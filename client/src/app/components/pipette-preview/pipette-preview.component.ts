import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PipetteService } from '@app/services/tools/pipette-service';
import { PREVIEW_SCALE, PREVIEW_SELECTION_SIZE } from '@app/shared/constant';

@Component({
    selector: 'app-pipette-preview',
    templateUrl: './pipette-preview.component.html',
    styleUrls: ['./pipette-preview.component.scss'],
})
export class PipettePreviewComponent implements AfterViewInit {
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;

    private pipettePreviewCtx: CanvasRenderingContext2D;

    constructor(private pipetteService: PipetteService) {}

    ngAfterViewInit(): void {
        this.previewCanvas.nativeElement.width = PREVIEW_SELECTION_SIZE * PREVIEW_SCALE;
        this.previewCanvas.nativeElement.height = PREVIEW_SELECTION_SIZE * PREVIEW_SCALE;
        this.pipettePreviewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.pipetteService.pipettePreviewCtx = this.pipettePreviewCtx;
    }
}
