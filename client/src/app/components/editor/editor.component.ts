import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MIN_CANVAS_SIZE } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

export enum anchorId {
    bottom,
    right,
    corner,
}

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('workzone', { static: false })
    workzone: ElementRef<HTMLDivElement>;

    @ViewChild('bottomAnchor', { static: false })
    bottomAnchor: ElementRef<HTMLDivElement>;

    @ViewChild('rightAnchor', { static: false })
    rightAnchor: ElementRef<HTMLDivElement>;

    @ViewChild('cornerAnchor', { static: false })
    cornerAnchor: ElementRef<HTMLDivElement>;

    canvasSize: Vec2;
    previewSize: Vec2;
    workzoneRect: DOMRect;
    mouseDown: boolean;
    resizeX: boolean;
    resizeY: boolean;

    constructor(private cd: ChangeDetectorRef) { }

    ngAfterViewInit(): void {
        this.workzoneRect = this.workzone.nativeElement.getBoundingClientRect();
        this.canvasSize = {
            x: this.workzoneRect.width / 2 > MIN_CANVAS_SIZE ? this.workzoneRect.width / 2 : MIN_CANVAS_SIZE,
            y: this.workzoneRect.height / 2 > MIN_CANVAS_SIZE ? this.workzoneRect.height / 2 : MIN_CANVAS_SIZE,
        };
        this.previewSize = this.canvasSize;
        this.setAnchorPosition();
        this.cd.detectChanges();
    }

    setAnchorPosition(): void {
        const canvasBorderSize = 2;
        const cornerHeightOffset = this.bottomAnchor.nativeElement.clientHeight + this.rightAnchor.nativeElement.clientHeight;

        this.bottomAnchor.nativeElement.style.top = (this.previewSize.y + 2 * canvasBorderSize).toString() + 'px';
        this.bottomAnchor.nativeElement.style.left = (this.previewSize.x / 2).toString() + 'px';

        this.rightAnchor.nativeElement.style.top = (this.previewSize.y / 2).toString() + 'px';
        this.rightAnchor.nativeElement.style.left = (this.previewSize.x + canvasBorderSize).toString() + 'px';

        this.cornerAnchor.nativeElement.style.top = (this.previewSize.y - cornerHeightOffset + canvasBorderSize).toString() + 'px';
        this.cornerAnchor.nativeElement.style.left = (this.previewSize.x + canvasBorderSize).toString() + 'px';
    }

    onMouseDown(event: MouseEvent, anchor: anchorId): void {
        this.previewSize = this.canvasSize;
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.resizeX = anchor === anchorId.right || anchor === anchorId.corner;
            this.resizeY = anchor === anchorId.bottom || anchor === anchorId.corner;
        }
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.resizeX) {
                const sizeX = event.x - this.workzoneRect.x;
                this.previewSize.x = sizeX > MIN_CANVAS_SIZE ? sizeX : MIN_CANVAS_SIZE;
            }
            if (this.resizeY) {
                const sizeY = event.y - this.workzoneRect.y;
                this.previewSize.y = sizeY > MIN_CANVAS_SIZE ? sizeY : MIN_CANVAS_SIZE;
            }
            this.setAnchorPosition();
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDown = false;
            // Setting directly to previewSize doesn't trigger the onChange event
            this.canvasSize = { x: this.previewSize.x, y: this.previewSize.y };
        }
    }
}
