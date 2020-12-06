import { SelectionType, Stamp, Texture, TraceTypes } from './enum';
// Canvas constants
export const MIN_CANVAS_SIZE = 250;

// Keyboard keys
export const KEYS = {
    SHIFT: 'Shift',
    BACKSPACE: 'Backspace',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_LEFT: 'ArrowLeft',
};
export const CONTROL = 17;
export const A_KEY = 65;

// Selection constants
export const MIDDLE_ANGLE_SNAP_DIVIDER = 4;
export const BASE_ANGLE_SNAP_DIVIDER = 8;
export const SELECTION_CONTOUR_BORDER_SIZE = 1;
export const SELECTION_CONTOUR_COLOUR = 'black';
export const SELECTED_BOX_COLOUR = '#111155';
export const SELECTED_ANCHOR_COLOR = '#aeaee0';
export const MIDDLE_SNAP_ANGLE = Math.PI / MIDDLE_ANGLE_SNAP_DIVIDER;
export const BASE_SNAP_ANGLE = Math.PI / BASE_ANGLE_SNAP_DIVIDER;
export const AEROSOL_DENSITY = 10;
export const AEROSOL_CONVERTER_TIMER = 10;
export const ANGLE_ROTATION = 15;
export const ROTATION_HALF = 180;
export const ROTATION_COMPLETE = 360;
export const DEG_TO_RAD_FACTOR = Math.PI / ROTATION_HALF;
export const DEPLACEMENT = 3;
export const DASHLINE_EMPTY = 5;
export const DASHLINE_FULL = 5;
export const NEGATIVE_MULTIPLIER = -1;
export const PERCENT_MULTIPLIER = 0.01;

// Pipette & Bucket Constants
export const PREVIEW_SELECTION_SIZE = 20;
export const PREVIEW_SCALE = 5;
export const PREVIEW_RADIUS_SIZE = 50;
export const R_POSITION = 0;
export const G_POSITION = 1;
export const B_POSITION = 2;
export const A_POSITION = 3;
export const MAX_TOLERANCE = 100;
export const MIN_TOLERANCE = 0;
export const PIXEL_INTERVAL = 4;

// Undo-Redo constants
export const DEFAULT_OPTIONS = {
    size: 1,
    angle: 0,
    texture: Texture.one,
    stamp: Stamp.one,
    traceType: TraceTypes.fill,
    tolerance: MIN_TOLERANCE,
    selectionType: SelectionType.rectangle,
    sprayDiameter: 1,
    emissionPerSecond: 1,
    spraySize: 20,
};
export const TEXTURES = [
    '/assets/textureOne.jpg',
    '/assets/textureTwo.jpg',
    '/assets/textureThree.jpg',
    '/assets/textureFour.jpg',
    '/assets/textureFive.jpg',
];
export const STAMPS = ['/assets/stampOne.png', '/assets/stampTwo.png', '/assets/stampThree.png', '/assets/stampFour.png', '/assets/stampFive.png'];
