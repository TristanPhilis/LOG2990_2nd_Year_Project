import { Injectable } from '@angular/core';
import { AnchorsPosition } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService {
    isActive: boolean;
    currentAnchor: AnchorsPosition;

    constructor() {
        this.isActive = false;
    }

    toggleMagnetism(): void {
        this.isActive = !this.isActive;
    }
}
