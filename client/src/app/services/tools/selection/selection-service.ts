import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectionBox } from '@app/classes/selection-box';
import { Selector } from '@app/classes/selector';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CanvasManipulationService } from '@app/services/utils/canvas-manipulation-service';
import {
    ARROW_DOWN,
    ARROW_LEFT,
    ARROW_RIGHT,
    ARROW_UP,
    DASHLINE_EMPTY,
    DASHLINE_FULL,
    DEFAULT_OPTIONS,
    DEPLACEMENT,
    ESCAPE_KEY,
    NEGATIVE_MULTIPLIER,
    SELECTION_BOX_COLOUR,
    SHIFT_KEY,
} from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options, SelectionType } from '@app/shared/enum';
import { EllipseSelectorService } from './ellipse-selector-service';
import { MagicSelectorService } from './magic-selector-service';
import { RectangleSelectorService } from './rectangle-selector-service';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool {
    currentSelector: Selector;
    selectorOptions: Selector[];
    isAreaSelected: boolean;
    selectedImageData: ImageData;
    selectedBox: BoundingBox;
    selectionBox: SelectionBox;
    draggingAnchorRelativePosition: Vec2;
    keyMap: boolean[] = [];

    constructor(
        drawingService: DrawingService,
        colorService: ColorSelectionService,
        private rectangleSelector: RectangleSelectorService,
        private ellipseSelector: EllipseSelectorService,
        private magicSelector: MagicSelectorService,
        private canvasUtil: CanvasManipulationService,
    ) {
        super(drawingService, colorService);
        this.setDefaultOptions();

        this.selectorOptions = [this.rectangleSelector, this.ellipseSelector, this.magicSelector];
        this.currentSelector = this.rectangleSelector;
        this.selectedBox = new BoundingBox();
        this.selectionBox = new SelectionBox();
        this.isAreaSelected = false;
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.selectionType, { value: DEFAULT_OPTIONS.selectionType, displayName: 'Type de sélection' }],
        ]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onOptionValueChange(): void {
        const selectionType = this.options.toolOptions.get(Options.selectionType);
        if (selectionType) {
            this.currentSelector = this.selectorOptions[selectionType.value];
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            if (this.isAreaSelected) {
                if (this.selectedBox.isInBox(currentCoord)) {
                    this.draggingAnchorRelativePosition = {
                        x: currentCoord.x - this.selectedBox.position.x,
                        y: currentCoord.y - this.selectedBox.position.y,
                    };
                } else {
                    this.placeImage();
                    if (this.currentSelector.id === SelectionType.magic) {
                        this.mouseDown = false;
                    } else {
                        this.initializeSelectionBox(currentCoord);
                    }
                }
            } else {
                this.initializeSelectionBox(currentCoord);
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (!this.isAreaSelected) {
                this.initializeSelectedBox();
            }
            this.mouseDown = false;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.drawingService.mouseIsOverCanvas) {
            if (event.buttons === MouseButton.Left && !this.isAreaSelected) {
                const currentCoord = this.getPositionFromMouse(event);
                this.selectionBox.updateOpposingCorner(currentCoord);
                this.currentSelector.drawSelectionBox(this.selectionBox, this.shiftDown);
            }

            if (!(event.buttons === MouseButton.Left) && !this.isAreaSelected) {
                this.initializeSelectedBox();
                this.mouseDown = false;
            }

            if (event.buttons === MouseButton.Left && this.isAreaSelected) {
                const currentCoord = this.getPositionFromMouse(event);
                this.translateSelectedBoxFromMouseMove(currentCoord);
                this.updateSelectedAreaPreview();
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === ESCAPE_KEY) {
            this.placeImage();
        }
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown && !this.isAreaSelected) {
                this.currentSelector.drawSelectionBox(this.selectionBox, this.shiftDown);
            }
        }
        event = event || event;
        // tslint:disable-next-line: deprecation
        this.keyMap[event.keyCode] = event.type === 'keydown';
    }

    onKeyDown(event: KeyboardEvent): void {
        event = event || event;
        // Need to use keyCode to travel in the keyMap
        // tslint:disable-next-line: deprecation
        this.keyMap[event.keyCode] = event.type === 'keydown';

        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown && !this.isAreaSelected) {
                this.currentSelector.drawSelectionBox(this.selectionBox, this.shiftDown);
            }
        } else if (this.isAreaSelected) {
            if (this.keyMap[ARROW_DOWN]) {
                this.selectedBox.translateY(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
            if (this.keyMap[ARROW_UP]) {
                this.selectedBox.translateY(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (this.keyMap[ARROW_LEFT]) {
                this.selectedBox.translateX(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (this.keyMap[ARROW_RIGHT]) {
                this.selectedBox.translateX(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
        }
    }

    initializeSelectionBox(coord: Vec2): void {
        this.selectionBox.setAnchor(coord);
        this.selectionBox.updateOpposingCorner(coord);
    }

    initializeSelectedBox(): void {
        this.selectedBox.updateFromSelectionBox(this.selectionBox, this.shiftDown);
        this.selectedBox.oldSelectedBox = this.selectedBox.copy();
        this.isAreaSelected = this.selectedBox.width > 0 && this.selectedBox.height > 0;
        if (this.isAreaSelected) {
            this.selectedImageData = this.currentSelector.copyArea(this.selectedBox);
            this.updateSelectedAreaPreview();
        }
    }

    private translateSelectedBoxFromMouseMove(coord: Vec2): void {
        const distanceFromLeft = coord.x - this.selectedBox.left;
        const xTranslate = distanceFromLeft - this.draggingAnchorRelativePosition.x;
        this.selectedBox.translateX(xTranslate);
        const distanceFromTop = coord.y - this.selectedBox.top;
        const yTranslate = distanceFromTop - this.draggingAnchorRelativePosition.y;
        this.selectedBox.translateY(yTranslate);
    }

    private updateSelectedAreaPreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawSelectedBox();
        this.drawingService.previewCtx.putImageData(this.selectedImageData, this.selectedBox.position.x, this.selectedBox.position.y);
    }

    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.selectionCtx);
        if (this.isAreaSelected) {
            const ctx = this.drawingService.baseCtx;
            const action = this.getDrawingAction();
            this.action.next(action);
            this.draw(ctx, action);
        }
        this.isAreaSelected = false;
        this.selectedImageData = { data: new Uint8ClampedArray(), width: 0, height: 0 };
    }

    selectAllCanvas(): void {
        this.selectionBox.setAnchor({ x: 0, y: 0 });
        this.selectionBox.updateOpposingCorner({ x: this.drawingService.canvas.width, y: this.drawingService.canvas.height });
        this.initializeSelectedBox();
        this.mouseDown = false;
    }

    private drawSelectedBox(): void {
        const ctx = this.drawingService.selectionCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.beginPath();
        ctx.strokeStyle = SELECTION_BOX_COLOUR;
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.rect(this.selectedBox.position.x, this.selectedBox.position.y, this.selectedBox.width, this.selectedBox.height);
        ctx.stroke();
        ctx.setLineDash([]);
        const buttonSize = 5;
        ctx.beginPath();
        ctx.arc(this.selectedBox.left, this.selectedBox.top, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, this.selectedBox.top, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.left, this.selectedBox.bottom, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, this.selectedBox.bottom, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc((this.selectedBox.left + this.selectedBox.right) / 2, this.selectedBox.top, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, (this.selectedBox.top + this.selectedBox.bottom) / 2, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc((this.selectedBox.left + this.selectedBox.right) / 2, this.selectedBox.bottom, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, (this.selectedBox.top + this.selectedBox.bottom) / 2, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const box = drawingAction.box as BoundingBox;
        const imageData = drawingAction.imageData;
        const selectorId = drawingAction.options.toolOptions.get(Options.selectionType);
        if (box && imageData && selectorId) {
            this.selectorOptions[selectorId.value].clearBaseCanvasSelectedArea(box.oldSelectedBox);
            const image = this.canvasUtil.getImageFromImageData(imageData);
            ctx.drawImage(image, box.position.x, box.position.y);
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };

        return {
            id: DrawingToolId.selectionService,
            imageData: this.selectedImageData,
            box: this.selectedBox.copy(),
            options,
        };
    }
}
