import { Texture, TraceTypes } from './enum';
export const MIN_CANVAS_SIZE = 250;
export const SHIFT_KEY = 'Shift';
export const BACKSPACE_KEY = 'Backspace';
export const ESCAPE_KEY = 'Escape';
export const PERCENT_MULTIPLIER = 0.01;
export const DASHLINE_EMPTY = 5;
export const DASHLINE_FULL = 15;
export const MIDDLE_ANGLE_SNAP_DIVIDER = 4;
export const BASE_ANGLE_SNAP_DIVIDER = 8;
export const MIDDLE_SNAP_ANGLE = Math.PI / MIDDLE_ANGLE_SNAP_DIVIDER;
export const BASE_SNAP_ANGLE = Math.PI / BASE_ANGLE_SNAP_DIVIDER;

export const DEFAULT_OPTIONS = {
    size: 1,
    texture: Texture.one,
    traceType: TraceTypes.fill,
};
export const R_POSITION = 0;
export const G_POSITION = 1;
export const B_POSITION = 2;
export const A_POSITION = 3;

export const MAX_TOLERANCE = 100;
export const MIN_TOLERANCE = 0;
export const PIXEL_INTERVAL = 4;
