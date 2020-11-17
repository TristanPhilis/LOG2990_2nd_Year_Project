import { Vec2 } from './vec2';

export interface ResizeAction {
    oldSize: Vec2;
    newSize: Vec2;
    imageData: ImageData;
}
