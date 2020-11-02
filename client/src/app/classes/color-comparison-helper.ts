import { MAX_TOLERANCE } from '@app/shared/constant';
import { Color, MAX_RGBA_VALUE } from './color';

interface Lab {
    L: number;
    a: number;
    b: number;
}

interface XYZ {
    X: number;
    Y: number;
    Z: number;
}

export const isColorSimilar = (color1: Color, color2: Color, tolerence: number): boolean => {
    const labColor1: Lab = getLabFromColor(color1);
    const labColor2: Lab = getLabFromColor(color2);
    const difference = calculateDeltaE(labColor1, labColor2);
    return Math.min(difference, MAX_TOLERANCE) <= tolerence;
};

// Steps taking from http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_Lab.html
const getLabFromColor = (color: Color): Lab => {
    const xyzColor = getXYZFromColor(color);

    // Using illuminant D65 for reference white tristimulus values as seen in link below
    // http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
    const referenceX = 0.95047;
    const referenceY = 1;
    const referenceZ = 1.08883;

    // Calculating adjusted XYZ values
    const adjustedX = xyzColor.X / referenceX;
    const adjustedY = xyzColor.Y / referenceY;
    const adjustedZ = xyzColor.Z / referenceZ;

    // Calculating XYZ functions
    const epsilon = 0.008856;
    const kappa = 903.3;
    const divider = 116;
    const additionValue = 16;

    const alternativeFucntionValue = (value: number): number => {
        return (kappa * value + additionValue) / divider;
    };

    const xFunction = adjustedX > epsilon ? Math.cbrt(adjustedX) : alternativeFucntionValue(adjustedX);
    const yFunction = adjustedY > epsilon ? Math.cbrt(adjustedY) : alternativeFucntionValue(adjustedY);
    const zFunction = adjustedZ > epsilon ? Math.cbrt(adjustedZ) : alternativeFucntionValue(adjustedZ);

    // values taking from equation without any meaning, as far as I know, linked to them
    // tslint:disable:no-magic-numbers
    return {
        L: 116 * yFunction - 16,
        a: 500 * (xFunction - yFunction),
        b: 200 * (yFunction - zFunction),
    };
    // tslint:enable:no-magic-numbers
};

// lots of values in this function, like multiplication matrix, taken from website without meaning explained
// tslint:disable:no-magic-numbers
// Steps taking from http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html
const getXYZFromColor = (color: Color): XYZ => {
    // Bring 0-255 range to 0-1 range
    let r = color.r / MAX_RGBA_VALUE;
    let g = color.g / MAX_RGBA_VALUE;
    let b = color.b / MAX_RGBA_VALUE;

    // Inverse sRGB Companding
    r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Applying conversion matrix using sRGB and referenced white of D65 as seen in the link bellow
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    return {
        X: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
        Y: r * 0.2126729 + g * 0.7151522 + b * 0.072175,
        Z: r * 0.0193339 + g * 0.119192 + b * 0.9503041,
    };
};
// tslint:enable:no-magic-numbers

// Using DeltaE version CIE94 as seen here: http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE94.html
const calculateDeltaE = (lab1: Lab, lab2: Lab): number => {
    const defaultK = 1;
    const k1 = 0.045;
    const k2 = 0.015;

    // First term
    const deltaL = lab1.L - lab2.L;
    const sL = 1;
    const firstTerm = Math.pow(deltaL / (defaultK * sL), 2);

    // Second term
    const c1 = Math.sqrt(Math.pow(lab1.a, 2) + Math.pow(lab1.b, 2));
    const c2 = Math.sqrt(Math.pow(lab2.a, 2) + Math.pow(lab2.b, 2));
    const deltaC = c1 - c2;
    const deltaCSquared = deltaC * deltaC;
    const sc = 1 + k1 * c1;
    const secondTerm = deltaCSquared / Math.pow(defaultK * sc, 2);

    // Third term
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    const deltaHSquared = deltaA * deltaA + deltaB * deltaB - deltaCSquared;
    const sh = 1 + k2 * c1;
    const thirdTerm = deltaHSquared / Math.pow(defaultK * sh, 2);

    return Math.sqrt(firstTerm + secondTerm + thirdTerm);
};
