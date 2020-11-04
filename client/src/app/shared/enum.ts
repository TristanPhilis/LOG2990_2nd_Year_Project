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
}

export enum drawingToolId {
    pencilService,
    rectangleService,
    ellipseService,
    eraserService,
    lineService,
    brushService,
    rectangleSelectionService,
    ellipseSelectionService,
    polygonService,
    bucketService,
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
    one = '/assets/textureOne.jpg',
    two = '/assets/textureTwo.jpg',
    three = '/assets/textureThree.jpg',
    four = '/assets/textureFour.jpg',
    five = '/assets/textureFive.jpg',
}

export enum TraceTypes {
    fill,
    stroke,
    fillAndStroke,
}

export enum ColorSelection {
    primary,
    secondary,
}

export enum JointSelection {
    normal,
    dot,
}

export enum SelectionType {
    rectangle,
    ellipse,
}
