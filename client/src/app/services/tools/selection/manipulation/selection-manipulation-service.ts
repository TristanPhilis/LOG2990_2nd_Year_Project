import { Injectable } from '@angular/core';
import { Anchor } from '@app/classes/anchor';
import { SelectedBox } from '@app/classes/selected-box';
import { Vec2 } from '@app/classes/vec2';
import { AnchorsPosition } from '@app/shared/enum';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectionManipulationService {
    private resizeLeft: boolean;
    private resizeRight: boolean;
    private resizeTop: boolean;
    private resizeBottom: boolean;
    private clickedAnchor: AnchorsPosition;
    private cornerAnchors: AnchorsPosition[];
    private aspectRatio: number;
    onSelectedBoxChange: Subject<null>;

    constructor() {
        this.resizeBottom = false;
        this.resizeLeft = false;
        this.resizeRight = false;
        this.resizeTop = false;
        this.cornerAnchors = [AnchorsPosition.topLeft, AnchorsPosition.topRight, AnchorsPosition.bottomLeft, AnchorsPosition.bottomRight];
        this.onSelectedBoxChange = new Subject<null>();
    }

    initializeAnchorMouvement(selectedBox: SelectedBox, anchor: AnchorsPosition): void {
        this.aspectRatio = selectedBox.width / selectedBox.height;
        this.clickedAnchor = anchor;
        this.resizeTop = anchor === AnchorsPosition.topLeft || anchor === AnchorsPosition.middleTop || anchor === AnchorsPosition.topRight;
        this.resizeBottom =
            anchor === AnchorsPosition.bottomLeft || anchor === AnchorsPosition.middleBottom || anchor === AnchorsPosition.bottomRight;
        this.resizeLeft = anchor === AnchorsPosition.topLeft || anchor === AnchorsPosition.middleLeft || anchor === AnchorsPosition.bottomLeft;
        this.resizeRight = anchor === AnchorsPosition.topRight || anchor === AnchorsPosition.middleRight || anchor === AnchorsPosition.bottomRight;
    }

    processAnchorMouvement(selectedBox: SelectedBox, coord: Vec2, keepAspectRatio: boolean): void {
        const dirtyAnchors = new Set<AnchorsPosition>();
        const adjustedCoord = selectedBox.getAngleAdjustedCoord(coord, true);
        if (this.resizeLeft) {
            selectedBox.left = adjustedCoord.x;
            dirtyAnchors
                .add(AnchorsPosition.topLeft)
                .add(AnchorsPosition.bottomLeft)
                .add(AnchorsPosition.middleLeft)
                .add(AnchorsPosition.middleTop)
                .add(AnchorsPosition.middleBottom);
        }
        if (this.resizeRight) {
            selectedBox.right = adjustedCoord.x;
            dirtyAnchors
                .add(AnchorsPosition.topRight)
                .add(AnchorsPosition.middleRight)
                .add(AnchorsPosition.bottomRight)
                .add(AnchorsPosition.middleTop)
                .add(AnchorsPosition.middleBottom);
        }
        if (this.resizeBottom) {
            selectedBox.bottom = adjustedCoord.y;
            dirtyAnchors
                .add(AnchorsPosition.bottomLeft)
                .add(AnchorsPosition.bottomRight)
                .add(AnchorsPosition.middleBottom)
                .add(AnchorsPosition.middleLeft)
                .add(AnchorsPosition.middleRight);
        }
        if (this.resizeTop) {
            selectedBox.top = adjustedCoord.y;
            dirtyAnchors
                .add(AnchorsPosition.topLeft)
                .add(AnchorsPosition.topRight)
                .add(AnchorsPosition.middleTop)
                .add(AnchorsPosition.middleLeft)
                .add(AnchorsPosition.middleRight);
        }
        if (keepAspectRatio && this.cornerAnchors.includes(this.clickedAnchor)) {
            this.restoreAspectRatio(selectedBox);
        }
        this.updateDirtyAnchors(selectedBox, dirtyAnchors);
        this.onSelectedBoxChange.next();
    }

    processWheelMouvement(selectedBox: SelectedBox, angleChange: number): void {
        selectedBox.angle += angleChange;
        this.onSelectedBoxChange.next();
    }

    adjustPositionToNewCenter(selectedBox: SelectedBox): void {
        const newCenter = selectedBox.center;
        const angleAdjustedNewCenter = selectedBox.getAngleAdjustedCoord(newCenter);

        const xTranslation = angleAdjustedNewCenter.x - newCenter.x;
        const yTranslation = angleAdjustedNewCenter.y - newCenter.y;

        selectedBox.translateX(xTranslation);
        selectedBox.translateY(yTranslation);
        selectedBox.rotationCenter = selectedBox.center;
    }

    private restoreAspectRatio(selectedBox: SelectedBox): void {
        const adjustedHeight = selectedBox.width / this.aspectRatio;
        selectedBox.bottom = selectedBox.top + adjustedHeight;
    }

    private updateDirtyAnchors(selectedBox: SelectedBox, dirtyAnchors: Set<AnchorsPosition>): void {
        for (const anchorKey of dirtyAnchors) {
            const anchorBox = selectedBox.anchors.get(anchorKey) as Anchor;
            switch (anchorKey) {
                case AnchorsPosition.topLeft: {
                    anchorBox.centerCoord.x = selectedBox.left;
                    anchorBox.centerCoord.y = selectedBox.top;
                    break;
                }
                case AnchorsPosition.middleTop: {
                    anchorBox.centerCoord.x = selectedBox.center.x;
                    anchorBox.centerCoord.y = selectedBox.top;
                    break;
                }
                case AnchorsPosition.topRight: {
                    anchorBox.centerCoord.x = selectedBox.right;
                    anchorBox.centerCoord.y = selectedBox.top;
                    break;
                }
                case AnchorsPosition.middleLeft: {
                    anchorBox.centerCoord.x = selectedBox.left;
                    anchorBox.centerCoord.y = selectedBox.center.y;
                    break;
                }
                case AnchorsPosition.middleRight: {
                    anchorBox.centerCoord.x = selectedBox.right;
                    anchorBox.centerCoord.y = selectedBox.center.y;
                    break;
                }
                case AnchorsPosition.bottomLeft: {
                    anchorBox.centerCoord.x = selectedBox.left;
                    anchorBox.centerCoord.y = selectedBox.bottom;
                    break;
                }
                case AnchorsPosition.middleBottom: {
                    anchorBox.centerCoord.x = selectedBox.center.x;
                    anchorBox.centerCoord.y = selectedBox.bottom;
                    break;
                }
                case AnchorsPosition.bottomRight: {
                    anchorBox.centerCoord.x = selectedBox.right;
                    anchorBox.centerCoord.y = selectedBox.bottom;
                    break;
                }
            }
        }
    }
}
