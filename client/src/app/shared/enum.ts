export enum sidebarToolID {
    move,
    selection,
    tracing,
    shapes,
    line,
    text,
    paintBucket,
    stamp,
    pipette,
    eraser,
    createNew,
    saveCurrent,
    openCarrousel,
    exportCurrent,
    openGuide,
    undo,
    redo,
}

export enum drawingToolId {
    pencilService,
    rectangleService,
    ellipseService,
    eraserService,
    lineService,
    brushService,
    rectangleSelectionService,
    polygonService,
    bucketService,
    pipetteService,
}

export enum MouseButton {
    None = 0,
    Left = 1,
    Right = 2,
    both = 3,
    Middle = 4,
    Forward = 5,
}

export enum Texture {
    one,
    two,
    three,
    four,
    five,
}

export enum TraceTypes {
    fill,
    stroke,
    fillAndStroke,
}

export enum JointSelection {
    normal,
    dot,
}

export enum SelectionType {
    rectangle,
    ellipse,
}

export enum Options {
    eraserSize,
    size,
    traceType,
    texture,
    tolerance,
    numberOfSides,
    angle,
    lineLength,
    emissionPerSecond,
    imageChoice,
}
