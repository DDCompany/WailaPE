/**
 * Util class for color manipulation.
 */
class ColorUtils {
    /**
     * Converts a hex color string or a rgb color object to a decimal color integer. The color string can start with #
     * or without.
     */
    compile(color: ColorValue): IntColor {
        if (typeof color === "number") {
            return color;
        }

        if (typeof color === "string") {
            return this.hexToDec(color);
        }

        return this.rgbToDec(color);
    }

    private rgbToDec({r, g, b}: RgbColor) {
        return (r << 16) + (g << 8) + (b);
    }

    private hexToDec(hex: string) {
        if (hex[0] === "#") {
            hex = hex.substring(1);
        }

        return parseInt(hex, 16);
    }
}