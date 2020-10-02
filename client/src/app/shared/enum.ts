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
    one = 'https://www.textures.com/system/gallery/photos/Overlays/142844/Overlays0054_3_download600.jpg',
    two = 'https://graphicriver.img.customer.envatousercontent.com/files/127947334/Artistic+brush+strokes+texture+(main+preview).jpg?auto=compress%2Cformat&fit=crop&crop=top&w=590&h=590&s=e97186536f1af7c1f362e06330561cd3',
    three = 'https://graphicriver.img.customer.envatousercontent.com/files/123430005/Artistic%20brush%20strokes%20texture%20(main%20preview).jpg?auto=compress%2Cformat&q=80&fit=crop&crop=top&max-h=8000&max-w=590&s=8a772be2757757feb791790f7de6c66d',
    four = 'https://i.pinimg.com/originals/a2/f3/fa/a2f3fab2b66b9dfc3fcc97404e25c294.jpg',
    five = 'https://static3.bigstockphoto.com/6/0/3/large2/306552718.jpg',
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
