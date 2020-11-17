import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class SelectionMouvementService {
    constructor(/* private magnetismService: MagnetismService, private gridService: GridService */) {
        //
    }

    processMouseMouvement(selectedBox: BoundingBox, currentMouseCoord: Vec2): void {
        const xTranslate = currentMouseCoord.x - selectedBox.mouseCoord.x;
        selectedBox.translateX(xTranslate);
        const yTranslate = currentMouseCoord.y - selectedBox.mouseCoord.y;
        selectedBox.translateY(yTranslate);
        selectedBox.mouseCoord = currentMouseCoord;
    }
}
