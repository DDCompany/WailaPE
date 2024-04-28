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
            return android.graphics.Color.parseColor(color);
        }

        let {a, r, g, b}: RgbaColor = color;
        return android.graphics.Color.argb(a, r, g, b);
    }
}