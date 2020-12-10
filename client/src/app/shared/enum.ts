export enum SidebarToolID {
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
    aerosol,
    grid,
    copy,
    cut,
    paste,
    delete,
    none,
}

export enum DrawingToolId {
    pencilService,
    rectangleService,
    ellipseService,
    eraserService,
    lineService,
    textService,
    brushService,
    selectionService,
    polygonService,
    bucketService,
    pipetteService,
    aerosolService,
    stampService,
    featherService,
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

export enum Stamp {
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
    magic,
}

export enum Options {
    eraserSize,
    size,
    stampSize,
    traceType,
    texture,
    tolerance,
    numberOfSides,
    angle,
    stamp,
    lineLength,
    emissionPerSecond,
    imageChoice,
    fontSize,
    font,
    fontWeight,
    textAlignment,
    selectionType,
    spraySize,
    sprayDiameter,
}

export enum Font {
    arial,
    verdana,
    newRoman,
    courier,
    serif,
    comicSans,
}

export enum FontWeight {
    normal,
    bold,
    italic,
}

export enum TextAlignment {
    left,
    centre,
    right,
}

export enum CanvasAnchorsId {
    bottom,
    right,
    corner,
}

export enum AnchorsPosition {
    topLeft,
    middleTop,
    topRight,
    middleRight,
    bottomRight,
    middleBottom,
    bottomLeft,
    middleLeft,
    center,
}
