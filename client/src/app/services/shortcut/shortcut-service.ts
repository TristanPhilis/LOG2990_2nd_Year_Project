import { Injectable } from '@angular/core';

declare type Callback = () => void;

@Injectable({
    providedIn: 'root',
})
export class ShortcutService {
    shortcuts: Map<string, Callback>;
    shortcutsEnabled: boolean;

    constructor() {
        this.shortcuts = new Map<string, Callback>();
        this.shortcutsEnabled = true;
    }

    execute(key: string): void {
        if (!this.shortcutsEnabled) {
            return;
        }
        const func = this.shortcuts.get(key);
        if (func) {
            func();
        }
    }
}
