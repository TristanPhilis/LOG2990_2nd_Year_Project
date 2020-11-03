import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color-service';
import { Vec2 } from '@app/classes/vec2';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
    @Input()
    hue: Color;

    @Output()
    colorChange: EventEmitter<Color> = new EventEmitter(true);

    @ViewChild('canvas')
    paletteCanvas: ElementRef<HTMLCanvasElement>;

    @ViewChild('wrapper')
    paletteWrapper: ElementRef<HTMLCanvasElement>;

    private paletteCtx: CanvasRenderingContext2D;
    private paletteWidth: number;
    private paletteHeight: number;
    private isMouseDown: boolean;
    private mouseCoord: Vec2;

    ngAfterViewInit(): void {
        this.paletteCtx = this.paletteCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.paletteWidth = this.paletteWrapper.nativeElement.clientWidth;
        this.paletteHeight = this.paletteWrapper.nativeElement.clientHeight;

        this.setCanvas();
        this.draw();
    }

    setCanvas(): void {
        this.paletteCanvas.nativeElement.width = this.paletteWidth;
        this.paletteCanvas.nativeElement.height = this.paletteHeight;
        this.paletteCtx.strokeStyle = 'white';
        this.paletteCtx.lineWidth = 2;
    }

    ApplyGradient(): void {
        const whiteGradiant = this.paletteCtx.createLinearGradient(0, 0, this.paletteWidth, 0);
        whiteGradiant.addColorStop(0, 'rgba(255,255,255,1');
        whiteGradiant.addColorStop(1, 'rgba(255,255,255,0');
        this.paletteCtx.fillStyle = whiteGradiant;
        this.paletteCtx.fillRect(0, 0, this.paletteWidth, this.paletteHeight);

        const blackGradiant = this.paletteCtx.createLinearGradient(0, 0, 0, this.paletteHeight);
        blackGradiant.addColorStop(0, 'rgba(0,0,0,0');
        blackGradiant.addColorStop(1, 'rgba(0,0,0,1');
        this.paletteCtx.fillStyle = blackGradiant;
        this.paletteCtx.fillRect(0, 0, this.paletteWidth, this.paletteHeight);
    }

    draw(): void {
        this.paletteCtx.clearRect(0, 0, this.paletteWidth, this.paletteHeight);
        this.paletteCtx.fillStyle = this.hue ? this.hue.getRgbString() : 'rgba(255,255,255,1)';
        this.paletteCtx.fillRect(0, 0, this.paletteWidth, this.paletteHeight);
        this.ApplyGradient();
        this.drawSelector();
    }

    drawSelector(): void {
        if (this.mouseCoord) {
            const radius = 5;
            const startAngle = 0;
            const finalAngle = 2 * Math.PI;
            this.paletteCtx.beginPath();
            this.paletteCtx.arc(this.mouseCoord.x, this.mouseCoord.y, radius, startAngle, finalAngle);
            this.paletteCtx.stroke();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        const hueInput = 'hue';
        if (changes[hueInput] && this.paletteCtx) {
            this.draw();
            if (this.mouseCoord) {
                this.emitColor();
            }
        }
    }

    emitColor(): void {
        this.colorChange.emit(this.getColorAtCurrentPosition());
    }

    getColorAtCurrentPosition(): Color {
        const imageData = this.paletteCtx.getImageData(this.mouseCoord.x, this.mouseCoord.y, 1, 1).data;
        return new Color(imageData[0], imageData[1], imageData[2]);
    }

    onMouseDown(event: MouseEvent): void {
        this.isMouseDown = true;
        this.mouseCoord = { x: event.offsetX, y: event.offsetY };
        this.draw();
        this.emitColor();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.isMouseDown) {
            this.mouseCoord = { x: event.offsetX, y: event.offsetY };
            this.draw();
            this.emitColor();
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.isMouseDown = false;
    }
}
