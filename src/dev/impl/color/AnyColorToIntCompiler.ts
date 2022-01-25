class AnyColorToIntCompiler implements ColorToIntCompiler<ColorValue> {
    compile(color: ColorValue): IntColor {
        if (typeof color === "number") {
            return color;
        }

        if (typeof color === "string") {
            return AnyColorToIntCompiler.hexToDec(color);
        }

        return AnyColorToIntCompiler.rgbToDec(color);
    }

    private static rgbToDec({r, g, b}: RgbColor) {
        return (r << 16) + (g << 8) + (b);
    }

    private static hexToDec(hex: string) {
        if (hex[0] === "#") {
            hex = hex.substring(1);
        }

        return parseInt(hex, 16);
    }
}