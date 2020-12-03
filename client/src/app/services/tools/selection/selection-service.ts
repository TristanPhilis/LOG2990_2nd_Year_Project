import { Injectable, OnDestroy } from '@angular/core';
import { Anchor } from '@app/classes/anchor';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionAction } from '@app/classes/selection-action';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { Selector } from '@app/classes/selector';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid-service';
import { HitboxDetectionService } from '@app/services/tools/selection/hit-detection/hitbox-detection-service';
import { SelectionManipulationService } from '@app/services/tools/selection/manipulation/selection-manipulation-service';
import { SelectionMouvementService } from '@app/services/tools/selection/mouvement/selection-mouvement-service';
import { EllipseSelectorService } from '@app/services/tools/selection/selector/ellipse-selector-service';
import { MagicSelectorService } from '@app/services/tools/selection/selector/magic-selector-service';
import { RectangleSelectorService } from '@app/services/tools/selection/selector/rectangle-selector-service';
import { CanvasManipulationService } from '@app/services/utils/canvas-manipulation-service';
import { ANGLE_ROTATION, DEFAULT_OPTIONS, ESCAPE_KEY, SELECTED_ANCHOR_COLOR, SELECTED_BOX_COLOUR, SHIFT_KEY } from '@app/shared/constant';
import { AnchorsPosition, DrawingToolId, MouseButton, Options, SelectionType } from '@app/shared/enum';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool implements OnDestroy {
    currentSelector: Selector;
    selectorOptions: Selector[];
    isAreaSelected: boolean;
    isAnchorClicked: boolean;
    selectionImageData: SelectionImageData;
    selectedBox: SelectedBox;
    selectionBox: SelectionBox;
    initialSelectionZone: BoundingBox;
    private subsciptions: Subscription;

    constructor(
        drawingService: DrawingService,
        colorService: ColorSelectionService,
        private rectangleSelector: RectangleSelectorService,
        private ellipseSelector: EllipseSelectorService,
        private magicSelector: MagicSelectorService,
        private canvasUtil: CanvasManipulationService,
        private mouvementService: SelectionMouvementService,
        private hitDetectionService: HitboxDetectionService,
        private manipulationService: SelectionManipulationService,
        private gridService: GridService,
    ) {
        super(drawingService, colorService);
        this.setDefaultOptions();

        this.selectorOptions = [this.rectangleSelector, this.ellipseSelector, this.magicSelector];
        this.currentSelector = this.rectangleSelector;
        this.selectedBox = new SelectedBox();
        this.selectionBox = new SelectionBox();
        this.initialSelectionZone = new BoundingBox();
        this.isAreaSelected = false;
        this.subsciptions = new Subscription();
        this.subscribeToEvents();
    }

    private subscribeToEvents(): void {
        this.subsciptions.add(
            this.hitDetectionService.onAnchorClicked.subscribe((anchor: AnchorsPosition) => {
                this.onAnchorClicked(anchor);
            }),
        );
        this.subsciptions.add(
            this.hitDetectionService.onSelectedBoxClicked.subscribe((coord: Vec2) => {
                this.onSelectedBoxClicked(coord);
            }),
        );
        this.subsciptions.add(
            this.gridService.onMagnetismStateChange.subscribe(() => {
                if (this.isAreaSelected) {
                    this.drawAnchors();
                }
            }),
        );
        this.subsciptions.add(
            this.mouvementService.onSelectedBoxMove.subscribe(() => {
                this.updateSelectedAreaPreview();
            }),
        );
        this.subsciptions.add(
            this.manipulationService.onSelectedBoxChange.subscribe(() => {
                this.updateSelectedAreaPreview();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subsciptions.unsubscribe();
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
        if (!this.mouseDown) {
            return;
        }

        const currentCoord = this.getPositionFromMouse(event);
        if (this.isAreaSelected) {
            const isHit = this.hitDetectionService.processMouseDown(this.selectedBox, currentCoord);
            if (!isHit) {
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

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (!this.isAreaSelected) {
                this.initializeSelectedBox();
            } else if (this.isAnchorClicked) {
                this.isAnchorClicked = false;
                this.manipulationService.adjustPositionToNewCenter(this.selectedBox);
            }
            this.mouseDown = false;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) {
            return;
        }

        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (this.isAreaSelected) {
            if (this.isAnchorClicked) {
                this.manipulationService.processAnchorMouvement(this.selectedBox, this.mouseDownCoord, this.shiftDown);
            } else {
                this.mouvementService.processMouseMouvement(this.selectedBox, this.mouseDownCoord);
            }
        } else {
            if (event.buttons === MouseButton.Left) {
                this.selectionBox.updateOpposingCorner(this.mouseDownCoord);
                this.currentSelector.drawSelectionBox(this.selectionBox, this.shiftDown);
            } else {
                this.initializeSelectedBox();
                this.mouseDown = false;
            }
        }
    }

    onAnchorClicked(anchor: AnchorsPosition): void {
        this.isAnchorClicked = true;
        this.manipulationService.initializeAnchorMouvement(this.selectedBox, anchor);
    }

    onSelectedBoxClicked(coord: Vec2): void {
        this.selectedBox.mouseCoord = coord;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === ESCAPE_KEY) {
            this.placeImage();
        }
        if (this.isAreaSelected && this.mouvementService.canProcessKey(event.key)) {
            this.mouvementService.processKeyUp(this.selectedBox, event.key);
        }
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            this.onShiftKeyEvent();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.isAreaSelected && this.mouvementService.canProcessKey(event.key)) {
            event.preventDefault();
            this.mouvementService.processKeyDown(this.selectedBox, event.key);
        }
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            this.onShiftKeyEvent();
        }
    }

    private onShiftKeyEvent(): void {
        if (!this.mouseDown) {
            return;
        }
        if (!this.isAreaSelected) {
            this.currentSelector.drawSelectionBox(this.selectionBox, this.shiftDown);
        } else if (this.isAnchorClicked) {
            this.manipulationService.processAnchorMouvement(this.selectedBox, this.mouseDownCoord, this.shiftDown);
        }
    }

    onWheel(event: WheelEvent): void {
        if (!this.isAreaSelected) {
            return;
        }
        event.preventDefault();
        let angleChange = event.altKey ? 1 : 1 * ANGLE_ROTATION;
        angleChange *= Math.sign(event.deltaY);
        this.manipulationService.processWheelMouvement(this.selectedBox, angleChange);
    }

    initializeSelectionBox(coord: Vec2): void {
        this.selectionBox.setAnchor(coord);
        this.selectionBox.updateOpposingCorner(coord);
    }

    initializeSelectedBox(): void {
        this.isAreaSelected = this.selectionBox.width > 0 && this.selectionBox.height > 0;
        if (this.isAreaSelected) {
            this.selectedBox.updateFromSelectionBox(this.selectionBox, this.shiftDown);
            this.initialSelectionZone.updateFromSelectionBox(this.selectionBox, this.shiftDown);
            this.selectionImageData = this.currentSelector.copyArea(this.selectedBox);
            this.clearInitialSelectedZone(this.selectionImageData.contours);
            this.updateSelectedAreaPreview();
        }
    }

    private updateSelectedAreaPreview(): void {
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        this.drawSelectedBox();
        this.draw(ctx, this.getDrawingAction());
    }

    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.selectionCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            const action = this.getDrawingAction();
            this.action.next(action);
            this.draw(this.drawingService.baseCtx, action);
        }
        this.isAreaSelected = false;
    }

    selectAllCanvas(): void {
        this.selectionBox.setAnchor({ x: 0, y: 0 });
        this.selectionBox.updateOpposingCorner({ x: this.drawingService.canvas.width, y: this.drawingService.canvas.height });
        this.initializeSelectedBox();
        this.mouseDown = false;
    }

    private drawSelectedBox(): void {
        this.drawContours();
        const ctx = this.drawingService.selectionCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.strokeStyle = SELECTED_BOX_COLOUR;
        this.canvasUtil.applyRotation(ctx, this.selectedBox.radAngle, this.selectedBox.rotationCenter);
        ctx.beginPath();
        ctx.rect(this.selectedBox.position.x, this.selectedBox.position.y, this.selectedBox.width, this.selectedBox.height);
        ctx.stroke();
        ctx.resetTransform();
        this.drawAnchors();
    }

    private drawContours(): void {
        const image = this.selectionImageData.contourImage;
        if (!image) {
            return;
        }
        const ctx = this.drawingService.previewCtx;
        this.canvasUtil.applyRotation(ctx, this.selectedBox.radAngle, this.selectedBox.rotationCenter);
        this.canvasUtil.applyMirrorScaling(ctx, this.selectedBox);
        ctx.drawImage(image, this.selectedBox.position.x, this.selectedBox.position.y, this.selectedBox.width, this.selectedBox.height);
        ctx.resetTransform();
    }

    private drawAnchors(): void {
        const ctx = this.drawingService.selectionCtx;
        this.canvasUtil.applyRotation(ctx, this.selectedBox.radAngle, this.selectedBox.rotationCenter);
        ctx.fillStyle = 'white';
        this.selectedBox.anchors.forEach((anchor: Anchor) => {
            ctx.beginPath();
            ctx.rect(anchor.position.x, anchor.position.y, anchor.width, anchor.height);
            ctx.fill();
            ctx.stroke();
        });

        if (this.gridService.shouldSnapToGrid && this.gridService.currentAnchor !== AnchorsPosition.center) {
            const selectedAnchorBox = this.selectedBox.anchors.get(this.gridService.currentAnchor) as Anchor;
            ctx.beginPath();
            ctx.fillStyle = SELECTED_ANCHOR_COLOR;
            ctx.rect(selectedAnchorBox.position.x, selectedAnchorBox.position.y, selectedAnchorBox.width, selectedAnchorBox.height);
            ctx.fill();
            ctx.stroke();
        }
        ctx.resetTransform();
    }

    private clearInitialSelectedZone(contours: Path2D[]): void {
        const ctx = this.drawingService.baseCtx;
        ctx.fillStyle = 'white';
        for (const contour of contours) {
            ctx.fill(contour);
        }
    }

    draw(ctx: CanvasRenderingContext2D, selectionAction: SelectionAction): void {
        const selectedBox = selectionAction.selectedBox;
        const selectionImageData = selectionAction.selectionImageData;
        this.clearInitialSelectedZone(selectionImageData.contours);
        const image = this.canvasUtil.getImageFromImageData(selectionImageData.imageData);
        this.canvasUtil.applyRotation(ctx, selectedBox.radAngle, selectedBox.rotationCenter);
        this.canvasUtil.applyMirrorScaling(ctx, selectedBox);
        ctx.drawImage(image, selectedBox.position.x, selectedBox.position.y, selectedBox.width, selectedBox.height);
        ctx.resetTransform();
    }

    getDrawingAction(): SelectionAction {
        return {
            id: DrawingToolId.selectionService,
            selectedBox: this.selectedBox.copy(),
            selectionImageData: this.selectionImageData,
        };
    }
}