import { Vec2 } from './vec2';

export abstract class Box {
    get position(): Vec2 {
        return { x: 0, y: 0 };
    }

    get width(): number {
        return 0;
    }

    get height(): number {
        return 0;
    }
}
