import { BoundingBox } from './bounding-box';

export interface SelectionImageData {
    contours: Path2D[];
    contoursBoundingBox?: BoundingBox[]; // might not be needed, to see with magic selector
    contourImage?: CanvasImageSource;
    imageData: ImageData;
}
