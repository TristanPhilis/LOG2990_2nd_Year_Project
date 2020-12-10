import { Injectable } from '@angular/core';

declare type Callback = () => void;

@Injectable({
    providedIn: 'root',
})
export class ShortcutService {
    shortcuts: Map<string, Callback>;
    alwaysEnabledShorcuts: Set<string>;
    shortcutsEnabled: boolean;

    constructor() {
        this.shortcuts = new Map<string, Callback>();
        this.alwaysEnabledShorcuts = new Set<string>();
        this.shortcutsEnabled = true;
    }

    execute(key: string): void {
        if (!this.shortcutsEnabled && !this.alwaysEnabledShorcuts.has(key)) {
            return;
        }
        const func = this.shortcuts.get(key);
        if (func) {
            func();
        }
    }
}
