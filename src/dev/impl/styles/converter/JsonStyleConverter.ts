class JsonStyleConverter implements StyleConverter<JsonWailaStyle> {
    private static DEFAULT_VALUES: WailaStyle = {
        titleFont: {color: android.graphics.Color.WHITE, size: 50, shadow: 0},
        defaultFont: {color: android.graphics.Color.WHITE, size: 40, shadow: 0},
        errorFont: {color: android.graphics.Color.RED, size: 40, shadow: 0},
        okFont: {color: android.graphics.Color.GREEN, size: 40, shadow: 0},
        frameImage: "waila.frame.default",
        itemsMargin: 10,
        popupPadding: 10,
        scaleImage: "waila.scale.default",
        scaleFilledImage: "waila.scale.default_filled",
    };

    constructor(private readonly colorToInt: ColorToIntCompiler<ColorValue>) {
    }

    convert(from: JsonWailaStyle): WailaStyle {
        const defaultValues = JsonStyleConverter.DEFAULT_VALUES;
        return {
            ...defaultValues,
            ...from,
            titleFont: this.compileFont(from.titleFont, defaultValues.titleFont) || defaultValues.titleFont,
            defaultFont: this.compileFont(from.defaultFont, defaultValues.defaultFont) || defaultValues.defaultFont,
            errorFont: this.compileFont(from.errorFont, defaultValues.errorFont) || defaultValues.errorFont,
            okFont: this.compileFont(from.okFont, defaultValues.okFont) || defaultValues.okFont,
        };
    }

    private compileFont(font: Nullable<JsonFontDescription>, baseFont: UI.FontDescription): Nullable<UI.FontDescription> {
        if (!font) {
            return baseFont;
        }

        return {
            ...baseFont,
            ...font,
            color: font.color ? this.colorToInt.compile(font.color) : baseFont.color
        };
    }
}