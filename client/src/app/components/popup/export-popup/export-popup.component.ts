import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Filter } from '@app/classes/filter';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { WebRequestService } from '@app/services/index/web-request-service';
import { ValidatorService } from '@app/services/validator-service';
import { EmailInfo } from '@common/communication/email-info';

const MAX_PREVIEW_SIZE = 250;
const DEFAULT_TYPE = 'png';

@Component({
    selector: 'app-export-popup',
    templateUrl: './export-popup.component.html',
    styleUrls: ['./export-popup.component.scss'],
})
export class ExportPopupComponent implements OnInit, AfterViewInit {
    filterOptions: Filter[];
    nameInput: FormControl;
    emailInput: FormControl;
    fileType: string;
    private originalCanvas: HTMLCanvasElement;
    private selectedFilterValue: string;
    private previewSize: Vec2;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    private canvasCtx: CanvasRenderingContext2D;
    exportedDrawing: string;

    constructor(
        private drawingService: DrawingService,
        private renderer: Renderer2,
        private webRequestService: WebRequestService,
        private validatorService: ValidatorService,
    ) {}

    ngOnInit(): void {
        this.filterOptions = [
            { name: 'aucun', value: 'none' },
            { name: 'floue', value: 'blur(3px)' },
            { name: 'teinte de gris', value: 'grayScale(100)' },
            { name: 'sepia', value: 'sepia(100)' },
            { name: 'contraste', value: 'contrast(75)' },
            { name: 'inverser', value: 'invert(100)' },
        ];
        this.selectedFilterValue = 'none';
        this.nameInput = new FormControl('', [Validators.required]);
        this.emailInput = new FormControl('', [this.validatorService.isValidEmailAddress()]);
        this.fileType = DEFAULT_TYPE;
        this.originalCanvas = this.drawingService.canvas;
        this.exportedDrawing = '';

        this.setPreviewSize();
    }

    private setPreviewSize(): void {
        const aspectRatio = this.originalCanvas.width / this.originalCanvas.height;
        const isWiderThanTall = this.originalCanvas.width > this.originalCanvas.height;
        this.previewSize = {
            x: isWiderThanTall ? MAX_PREVIEW_SIZE : MAX_PREVIEW_SIZE * aspectRatio,
            y: isWiderThanTall ? MAX_PREVIEW_SIZE / aspectRatio : MAX_PREVIEW_SIZE,
        };
    }

    ngAfterViewInit(): void {
        this.previewCanvas.nativeElement.width = this.previewSize.x;
        this.previewCanvas.nativeElement.height = this.previewSize.y;
        this.canvasCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasCtx.drawImage(this.originalCanvas, 0, 0, this.previewSize.x, this.previewSize.y);
    }

    updateFilter(filterValue: string): void {
        this.canvasCtx.clearRect(0, 0, this.previewSize.x, this.previewSize.y);
        this.selectedFilterValue = filterValue;
        this.applySelectedFilter(this.canvasCtx);
        this.canvasCtx.drawImage(this.originalCanvas, 0, 0, this.previewSize.x, this.previewSize.y);
    }

    applySelectedFilter(context: CanvasRenderingContext2D): void {
        context.filter = this.selectedFilterValue;
    }

    createExportUrl(): string {
        const finalCanvas = this.renderer.createElement('canvas');
        finalCanvas.width = this.originalCanvas.width;
        finalCanvas.height = this.originalCanvas.height;
        const finalCtx = finalCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.applySelectedFilter(finalCtx);
        finalCtx.drawImage(this.originalCanvas, 0, 0);

        return finalCanvas.toDataURL(`image/${this.fileType}`);
    }

    exportDrawing(): void {
        const a = this.renderer.createElement('a');
        a.href = this.createExportUrl();
        a.download = `${this.nameInput.value}.${this.fileType}`;
        a.click();
    }

    sendEmail(): void {
        this.exportedDrawing = this.createExportUrl();

        const sentEmail: EmailInfo = {
            emailAddress: this.emailInput.value,
            metadata: this.exportedDrawing,
            fileExtension: this.fileType,
            fileName: `${this.nameInput.value}.${this.fileType}`,
        };
        this.webRequestService.sendEmail(sentEmail)?.subscribe();
    }
}
