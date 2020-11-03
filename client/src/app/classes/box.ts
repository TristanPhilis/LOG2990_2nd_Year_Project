import { Vec2 } from './vec2';

export abstract class Box {
    abstract get position(): Vec2;

    abstract get width(): number;

    abstract get height(): number;

    abstract get center(): Vec2;
}
