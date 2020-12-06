const WIDTH = 100;
const HEIGHT = 100;

const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;

const drawCanvas = document.createElement('canvas');
drawCanvas.width = WIDTH;
drawCanvas.height = HEIGHT;

const selectionCanvas = document.createElement('canvas');
selectionCanvas.width = WIDTH;
selectionCanvas.height = HEIGHT;

// tslint:disable-next-line:no-non-null-assertion  line necessary to properly spy on a spyObj attribute (getter/setter)
const getSpyObjectProperty = <T>(spyObj: jasmine.SpyObj<T>, key: keyof T) => Object.getOwnPropertyDescriptor(spyObj, key)!.get! as jasmine.Spy;

const canvasTestHelper = { canvas, drawCanvas, selectionCanvas, getSpyObjectProperty };
export { canvasTestHelper };
