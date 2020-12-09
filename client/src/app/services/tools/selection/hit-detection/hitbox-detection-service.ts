import { Injectable, OnDestroy } from '@angular/core';
import { SelectedBox } from '@app/classes/selected-box';
import { Vec2 } from '@app/classes/vec2';
import { AnchorsPosition } from '@app/shared/enum';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HitboxDetectionService implements OnDestroy {
    onAnchorClicked: Subject<AnchorsPosition>;
    onSelectedBoxClicked: Subject<Vec2>;
    constructor() {
        this.onAnchorClicked = new Subject<AnchorsPosition>();
        this.onSelectedBoxClicked = new Subject<Vec2>();
    }

    ngOnDestroy(): void {
        this.onAnchorClicked.complete();
        this.onSelectedBoxClicked.complete();
    }

    processMouseDown(selectedBox: SelectedBox, coord: Vec2): boolean {
        const unrotatedCoord = selectedBox.getAngleAdjustedCoord(coord, true);
        for (const [key, anchor] of selectedBox.anchors) {
            if (anchor.isInBox(unrotatedCoord)) {
                this.onAnchorClicked.next(key);
                return true;
            }
        }
        const isInBox = selectedBox.isInBox(unrotatedCoord);
        if (isInBox) {
            this.onSelectedBoxClicked.next(coord);
        }
        return isInBox;
    }
}
