export interface Vec2 {
    x: number;
    y: number;
}

export interface UndoRedoPile {
    path: Vec2[];
    id: string;
    thickness?: number;
    traceType?: number;
}
