import { Injectable } from '@angular/core';
import { UndoRedoPile, Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    pathData: Vec2[];
    undoPile: UndoRedoPile[];
    redoPile: UndoRedoPile[];

    constructor() {}

    undo(): void {
        const lastIn = this.undoPile.pop();
        if (lastIn != undefined) {
            this.redoPile.push(lastIn);
        }
    }
    redo(): void {
        const lastIn = this.redoPile.pop();
        if (lastIn != undefined) {
            this.undoPile.push(lastIn);
        }
    }

    clearPile() {
        this.undoPile = [];
        this.redoPile = [];
    }
}
