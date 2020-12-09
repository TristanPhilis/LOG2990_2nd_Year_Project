import { Injectable, OnDestroy } from '@angular/core';
import { Anchor } from '@app/classes/anchor';
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
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { HitboxDetectionService } from '@app/services/tools/selection/hit-detection/hitbox-detection-service';
import { SelectionManipulationService } from '@app/services/tools/selection/manipulation/selection-manipulation-service';
import { SelectionMouvementService } from '@app/services/tools/selection/mouvement/selection-mouvement-service';
import { EllipseSelectorService } from '@app/services/tools/selection/selector/ellipse-selector-service';
import { MagicSelectorService } from '@app/services/tools/selection/selector/magic-selector-service';
import { RectangleSelectorService } from '@app/services/tools/selection/selector/rectangle-selector-service';
import { ANGLE_ROTATION, DEFAULT_OPTIONS, KEYS, SELECTED_ANCHOR_COLOR, SELECTED_BOX_COLOUR } from '@app/shared/constant';
import { AnchorsPosition, DrawingToolId, MouseButton, Options, SelectionType } from '@app/shared/enum';
import { CanvasManipulationService } from '@app/utils/canvas-manipulation-service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool implements OnDestroy {
    isAreaSelected: boolean;
    isAnchorClicked: boolean;
    selectionImageData: SelectionImageData;
    selectedBox: SelectedBox;
    private currentSelector: Selector;
    private selectorOptions: Selector[];
    private selectionBox: SelectionBox;
    private subscriptions: Subscription;

    constructor(
        drawingService: DrawingService,
        colorService: ColorSelectionService,
        shortCutService: ShortcutService,
        private rectangleSelector: RectangleSelectorService,
        private ellipseSelector: EllipseSelectorService,
        private magicSelector: MagicSelectorService,
        private canvasUtil: CanvasManipulationService,
        private mouvementService: SelectionMouvementService,
        private hitDetectionService: HitboxDetectionService,
        private manipulationService: SelectionManipulationService,
        private gridService: GridService,
    ) {
        super(drawingService, colorService, shortCutService);
        this.setDefaultOptions();

        this.selectorOptions = [this.rectangleSelector, this.ellipseSelector, this.magicSelector];
        this.currentSelector = this.rectangleSelector;
        this.selectedBox = new SelectedBox();
        this.selectionBox = new SelectionBox();
        this.isAreaSelected = false;
        this.subscriptions = new Subscription();
        this.subscribeToEvents();
    }

    private subscribeToEvents(): void {
        this.subscriptions.add(
            this.hitDetectionService.onAnchorClicked.subscribe((anchor: AnchorsPosition) => {
                this.onAnchorClicked(anchor);
            }),
        );
        this.subscriptions.add(
            this.hitDetectionService.onSelectedBoxClicked.subscribe((coord: Vec2) => {
                this.onSelectedBoxClicked(coord);
            }),
        );
        this.subscriptions.add(
            this.gridService.onMagnetismStateChange.subscribe(() => {
                if (this.isAreaSelected) {
                    this.drawAnchors();
                }
            }),
        );
        this.subscriptions.add(
            this.mouvementService.onSelectedBoxMove.subscribe(() => {
                this.updateSelectedAreaPreview();
            }),
        );
        this.subscriptions.add(
            this.manipulationService.onSelectedBoxChange.subscribe(() => {
                this.updateSelectedAreaPreview();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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
        const selectorIndex = (this.options.toolOptions.get(Options.selectionType) as ToolOption).value;
        this.currentSelector = this.selectorOptions[selectorIndex];
    }

    onMouseDown(event: MouseEvent): void {
        const isRightClick = event.buttons === MouseButton.Right;
        const isLeftClick = event.buttons === MouseButton.Left;
        this.mouseDown = isLeftClick || isRightClick;
        if (!this.mouseDown) {
            return;
        }

        const currentCoord = this.getPositionFromMouse(event);
        if (this.isAreaSelected && isLeftClick) {
            const isHit = this.hitDetectionService.processMouseDown(this.selectedBox, currentCoord);
            if (!isHit) {
                this.placeImage();
                if (this.currentSelector.id === SelectionType.magic) {
                    this.mouseDown = false;
                } else {
                    this.initializeSelectionBox(currentCoord);
                }
            }
        } else if (!this.isAreaSelected) {
            if (this.currentSelector.id === SelectionType.magic) {
                this.selectedBox = this.magicSelector.executeMagicSelection(currentCoord, isLeftClick);
                this.mouseDown = false;
                this.initializeSelectedArea();
            } else if (isLeftClick) {
                this.initializeSelectionBox(currentCoord);
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) {
            return;
        }
        if (!this.isAreaSelected) {
            this.initializeSelectedArea();
        } else if (this.isAnchorClicked) {
            this.isAnchorClicked = false;
            this.manipulationService.adjustPositionToNewCenter(this.selectedBox);
        }
        this.mouseDown = false;
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
                this.onActionStart();
                this.selectionBox.updateOpposingCorner(this.mouseDownCoord);
                this.currentSelector.drawSelectionBox(this.selectionBox, this.shiftDown);
            } else {
                this.initializeSelectedArea();
                this.mouseDown = false;
            }
        }
    }

    private onAnchorClicked(anchor: AnchorsPosition): void {
        this.isAnchorClicked = true;
        this.manipulationService.initializeAnchorMouvement(this.selectedBox, anchor);
    }

    private onSelectedBoxClicked(coord: Vec2): void {
        this.selectedBox.mouseCoord = coord;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.isAreaSelected && this.mouvementService.canProcessKey(event.key)) {
            event.preventDefault();
            this.mouvementService.processKeyDown(this.selectedBox, event.key);
        }
        if (event.key === KEYS.SHIFT) {
            this.shiftDown = true;
            this.onShiftKeyEvent();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === KEYS.ESCAPE) {
            this.placeImage();
        }
        if (this.isAreaSelected && this.mouvementService.canProcessKey(event.key)) {
            this.mouvementService.processKeyUp(this.selectedBox, event.key);
        }
        if (event.key === KEYS.SHIFT) {
            this.shiftDown = false;
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

    private initializeSelectionBox(coord: Vec2): void {
        this.selectionBox.setAnchor(coord);
        this.selectionBox.updateOpposingCorner(coord);
    }

    private initializeSelectedArea(): void {
        this.isAreaSelected = (this.selectionBox.width > 0 && this.selectionBox.height > 0) || this.currentSelector.id === SelectionType.magic;
        if (this.isAreaSelected) {
            this.onActionStart();
            if (this.currentSelector.id !== SelectionType.magic) {
                this.selectedBox.updateFromSelectionBox(this.selectionBox, this.shiftDown);
            }
            this.selectionImageData = this.currentSelector.copyArea(this.selectedBox);
            this.currentSelector.clearInitialSelectedZone(this.selectionImageData);
            this.updateSelectedAreaPreview();
        }
    }

    updateSelectedAreaPreview(): void {
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        this.drawSelectedBox();
        this.draw(ctx, this.getDrawingAction());
    }

    private placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.selectionCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            const action = this.getDrawingAction();
            this.action.next(action);
            this.draw(this.drawingService.baseCtx, action);
        }
        this.isAreaSelected = false;
        this.onActionFinish();
    }

    selectAllCanvas(): void {
        this.selectionBox.setAnchor({ x: 0, y: 0 });
        this.selectionBox.updateOpposingCorner({ x: this.drawingService.canvas.width, y: this.drawingService.canvas.height });
        this.initializeSelectedArea();
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

    draw(ctx: CanvasRenderingContext2D, selectionAction: SelectionAction): void {
        const selectedBox = selectionAction.selectedBox;
        const selectionImageData = selectionAction.selectionImageData;
        this.selectorOptions[selectionAction.selectorId].clearInitialSelectedZone(selectionImageData);
        const imageData = selectionImageData.imageData;
        if (!imageData) {
            return;
        }
        const image = this.canvasUtil.getImageFromImageData(imageData);
        this.canvasUtil.applyRotation(ctx, selectedBox.radAngle, selectedBox.rotationCenter);
        this.canvasUtil.applyMirrorScaling(ctx, selectedBox);
        ctx.drawImage(image, selectedBox.position.x, selectedBox.position.y, selectedBox.width, selectedBox.height);
        ctx.resetTransform();
    }

    getDrawingAction(): SelectionAction {
        return {
            id: DrawingToolId.selectionService,
            selectorId: this.currentSelector.id,
            selectedBox: this.selectedBox.copy(),
            selectionImageData: this.selectionImageData,
        };
    }
}
