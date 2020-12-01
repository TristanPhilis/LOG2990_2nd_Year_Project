import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';

@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('canvas')
    sliderCanvas: ElementRef<HTMLCanvasElement>;

    @ViewChild('wrapper')
    sliderWrapper: ElementRef<HTMLCanvasElement>;

    @Output()
    colorChange: EventEmitter<Color> = new EventEmitter();

    private sliderCtx: CanvasRenderingContext2D;
    private sliderWidth: number;
    private sliderHeight: number;
    private isMouseDown: boolean;
    private selectedHeight: number;

    ngAfterViewInit(): void {
        this.sliderCtx = this.sliderCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.sliderWidth = this.sliderWrapper.nativeElement.clientWidth;
        this.sliderHeight = this.sliderWrapper.nativeElement.clientHeight;
        this.setCanvas();
        this.draw();
    }

    private setCanvas(): void {
        this.sliderCanvas.nativeElement.width = this.sliderWidth;
        this.sliderCanvas.nativeElement.height = this.sliderHeight;

        const gradient = this.sliderCtx.createLinearGradient(0, 0, 0, this.sliderHeight);
        // Used in order to simplify the indication of the gradient stops
        // tslint:disable-next-line:no-magic-numbers
        const colorStops = [0, 0.17, 0.34, 0.51, 0.68, 0.85, 1];
        const colors = ['red', 'yellow', 'lime', 'cyan', 'blue', 'magenta', 'red'];
        for (let index = 0; index < colors.length; index++) {
            gradient.addColorStop(colorStops[index], colors[index]);
        }
        this.sliderCtx.fillStyle = gradient;

        this.sliderCtx.strokeStyle = 'white';
        this.sliderCtx.lineWidth = 2;
    }

    draw(): void {
        this.sliderCtx.clearRect(0, 0, this.sliderWidth, this.sliderHeight);
        this.sliderCtx.fillRect(0, 0, this.sliderWidth, this.sliderHeight);
        this.drawSliderNob();
    }

    private drawSliderNob(): void {
        const sliderHeight = 4;
        if (this.selectedHeight) {
            this.sliderCtx.strokeRect(0, this.selectedHeight - 2, this.sliderWidth, sliderHeight);
        }
    }

    private emitColor(colorCoord: Vec2): void {
        const color = this.getColorAtPosition(colorCoord);
        this.colorChange.emit(color);
    }

    private getColorAtPosition(colorCoord: Vec2): Color {
        const imageData = this.sliderCtx.getImageData(colorCoord.x, colorCoord.y, 1, 1).data;
        return new Color(imageData[0], imageData[1], imageData[2]);
    }

    onMouseDown(event: MouseEvent): void {
        this.isMouseDown = true;
        this.selectedHeight = event.offsetY;
        this.draw();
        this.emitColor({ x: event.offsetX, y: event.offsetY });
    }

    onMouseMove(event: MouseEvent): void {
        if (this.isMouseDown) {
            this.selectedHeight = event.offsetY;
            this.draw();
            this.emitColor({ x: event.offsetX, y: event.offsetY });
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.isMouseDown = false;
    }
}
