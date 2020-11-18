import { SelectionType, Stamp, Texture, TraceTypes } from './enum';
export const MIN_CANVAS_SIZE = 250;
export const SHIFT_KEY = 'Shift';
export const BACKSPACE_KEY = 'Backspace';
export const ESCAPE_KEY = 'Escape';
export const DEPLACEMENT = 3;
export const DASHLINE_EMPTY = 5;
export const DASHLINE_FULL = 15;
export const ANGLE_ROTATION = 15;
export const ROTATION_DEMI = 180;
export const ROTATION_COMPLETE = 360;
export const ARROW_UP = 38;
export const ARROW_DOWN = 40;
export const ARROW_LEFT = 37;
export const ARROW_RIGHT = 39;
export const CONTROL = 17;
export const A_KEY = 65;
export const NEGATIVE_MULTIPLIER = -1;
export const PERCENT_MULTIPLIER = 0.01;
export const MIDDLE_ANGLE_SNAP_DIVIDER = 4;
export const BASE_ANGLE_SNAP_DIVIDER = 8;
export const SELECTION_BOX_BORDER_SIZE = 5;
export const SELECTION_BOX_COLOUR = '#111155';
export const MIDDLE_SNAP_ANGLE = Math.PI / MIDDLE_ANGLE_SNAP_DIVIDER;
export const BASE_SNAP_ANGLE = Math.PI / BASE_ANGLE_SNAP_DIVIDER;

export const R_POSITION = 0;
export const G_POSITION = 1;
export const B_POSITION = 2;
export const A_POSITION = 3;

export const MAX_TOLERANCE = 100;
export const MIN_TOLERANCE = 0;
export const PIXEL_INTERVAL = 4;

export const DEFAULT_OPTIONS = {
    size: 1,
    angle: 0,
    texture: Texture.one,
    stamp: Stamp.one,
    traceType: TraceTypes.fill,
    tolerance: MIN_TOLERANCE,
    selectionType: SelectionType.rectangle,
};

export const TEXTURES = [
    '/assets/textureOne.jpg',
    '/assets/textureTwo.jpg',
    '/assets/textureThree.jpg',
    '/assets/textureFour.jpg',
    '/assets/textureFive.jpg',
];

export const STAMPS = ['/assets/stampOne.png', '/assets/stampTwo.png', '/assets/stampThree.png', '/assets/stampFour.png', '/assets/stampFive.png'];

export const PREVIEW_SELECTION_SIZE = 20;
export const PREVIEW_SCALE = 5;
export const PREVIEW_RADIUS_SIZE = 50;
