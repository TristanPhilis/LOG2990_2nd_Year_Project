import { Injectable } from '@angular/core';
import { SelectedBox } from '@app/classes/selected-box';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid-service';
import { DEPLACEMENT, KEYS, NEGATIVE_MULTIPLIER } from '@app/shared/constant';
import { Subject } from 'rxjs';

const PENDING_KEY_TIME = 500;
const MOUVEMENT_INTERVAL = 100;

@Injectable({
    providedIn: 'root',
})
export class SelectionMouvementService {
    private pressedKeys: Set<string>;
    private pendingKeys: Set<string>;
    private validKeys: string[];
    private isMoving: boolean;
    private mouvementTimerHandle: ReturnType<typeof setTimeout>;
    onSelectedBoxMove: Subject<null>;

    constructor(private gridService: GridService) {
        this.validKeys = [KEYS.ARROW_DOWN, KEYS.ARROW_LEFT, KEYS.ARROW_RIGHT, KEYS.ARROW_UP];
        this.pressedKeys = new Set<string>();
        this.pendingKeys = new Set<string>();
        this.isMoving = false;
        this.onSelectedBoxMove = new Subject<null>();
    }

    canProcessKey(key: string): boolean {
        return this.validKeys.includes(key);
    }

    processMouseMouvement(selectedBox: SelectedBox, currentMouseCoord: Vec2): void {
        const xTranslation = currentMouseCoord.x - selectedBox.mouseCoord.x;
        const yTranslation = currentMouseCoord.y - selectedBox.mouseCoord.y;
        this.translateSelectedBox(selectedBox, xTranslation, yTranslation);
        if (this.gridService.shouldSnapToGrid) {
            this.snapBoxToGrid(selectedBox);
        }
        this.adjustBoxIfMovingOutsideCanvas(selectedBox);
        this.onSelectedBoxMove.next();
    }

    processKeyUp(selectedBox: SelectedBox, key: string): void {
        this.pressedKeys.delete(key);
        if (this.pendingKeys.has(key)) {
            this.moveFromKeys(selectedBox, new Set([key]));
            this.pendingKeys.delete(key);
        }

        if (this.pressedKeys.size === 0) {
            clearInterval(this.mouvementTimerHandle);
            this.isMoving = false;
        }
    }

    processKeyDown(selectedBox: SelectedBox, key: string): void {
        if (this.pressedKeys.has(key)) {
            return;
        }
        this.pendingKeys.add(key);

        setTimeout(() => {
            if (this.pendingKeys.has(key)) {
                this.pendingKeys.delete(key);
                this.pressedKeys.add(key);
            }

            if (!this.isMoving && this.pressedKeys.size > 0) {
                this.isMoving = true;
                this.startMouvement(selectedBox);
            }
        }, PENDING_KEY_TIME);
    }

    private startMouvement(selectedBox: SelectedBox): void {
        this.mouvementTimerHandle = setInterval(() => {
            this.moveFromKeys(selectedBox, this.pressedKeys);
        }, MOUVEMENT_INTERVAL);
    }

    private moveFromKeys(selectedBox: SelectedBox, keys: Set<string>): void {
        const translation = { x: 0, y: 0 };
        const anchorCoord = selectedBox.getAnchorCoord(this.gridService.currentAnchor);
        for (const key of keys) {
            switch (key) {
                case KEYS.ARROW_DOWN: {
                    translation.y += this.gridService.shouldSnapToGrid ? this.getTranslationToHigherBoundGrid(anchorCoord.y) : DEPLACEMENT;
                    break;
                }
                case KEYS.ARROW_UP: {
                    translation.y += this.gridService.shouldSnapToGrid ? this.getTranslationToLowerBoundGrid(anchorCoord.y) : -DEPLACEMENT;
                    break;
                }
                case KEYS.ARROW_LEFT: {
                    translation.x += this.gridService.shouldSnapToGrid ? this.getTranslationToLowerBoundGrid(anchorCoord.x) : -DEPLACEMENT;
                    break;
                }
                case KEYS.ARROW_RIGHT: {
                    translation.x += this.gridService.shouldSnapToGrid ? this.getTranslationToHigherBoundGrid(anchorCoord.x) : DEPLACEMENT;
                    break;
                }
            }
        }
        this.translateSelectedBox(selectedBox, translation.x, translation.y);
        // need to adjust in case the opposite axis of the key pressed is not on a grid point
        if (this.gridService.shouldSnapToGrid) {
            this.snapBoxToGrid(selectedBox);
        }
        this.adjustBoxIfMovingOutsideCanvas(selectedBox);
        this.onSelectedBoxMove.next();
    }

    private adjustBoxIfMovingOutsideCanvas(selectedBox: SelectedBox): void {
        selectedBox.refreshBoundingBox();
        const boundingBox = selectedBox.boundingBox;
        if (boundingBox.right < 0) {
            selectedBox.translateX(boundingBox.right * NEGATIVE_MULTIPLIER);
        }
        if (boundingBox.bottom < 0) {
            selectedBox.translateY(boundingBox.bottom * NEGATIVE_MULTIPLIER);
        }
        if (boundingBox.left > this.gridService.canvasWidth) {
            selectedBox.translateX(this.gridService.canvasWidth - boundingBox.left);
        }
        if (boundingBox.top > this.gridService.canvasHeight) {
            selectedBox.translateY(this.gridService.canvasHeight - boundingBox.top);
        }
    }

    private snapBoxToGrid(selectedBox: SelectedBox): void {
        const anchorCoord = selectedBox.getAnchorCoord(this.gridService.currentAnchor);
        const xTranslation = this.getTranslationToClosestGrid(anchorCoord.x);
        const yTranslation = this.getTranslationToClosestGrid(anchorCoord.y);
        this.translateSelectedBox(selectedBox, xTranslation, yTranslation);
    }

    private getTranslationToClosestGrid(point: number): number {
        const distanceFromGrid = point % this.gridService.squareSize;
        const snapToLowerBound = distanceFromGrid < this.gridService.squareSize / 2;
        const translation = snapToLowerBound ? distanceFromGrid * NEGATIVE_MULTIPLIER : this.gridService.squareSize - distanceFromGrid;
        return translation;
    }

    private getTranslationToLowerBoundGrid(point: number): number {
        const distanceFromGrid = point % this.gridService.squareSize;
        return distanceFromGrid > 0 ? distanceFromGrid * NEGATIVE_MULTIPLIER : this.gridService.squareSize * NEGATIVE_MULTIPLIER;
    }

    private getTranslationToHigherBoundGrid(point: number): number {
        const distanceFromGrid = point % this.gridService.squareSize;
        return distanceFromGrid > 0 ? this.gridService.squareSize - distanceFromGrid : this.gridService.squareSize;
    }

    private translateSelectedBox(selectedBox: SelectedBox, xTranslation: number, yTranslation: number): void {
        selectedBox.translateX(xTranslation);
        selectedBox.translateY(yTranslation);
    }
}
