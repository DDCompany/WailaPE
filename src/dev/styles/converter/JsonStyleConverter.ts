class JsonStyleConverter implements StyleConverter<JsonWailaStyle> {
    private static MIN_VERSION = 1;
    private static ACTUAL_VERSION = 1;
    private static DEFAULT_VALUES: WailaStyle = {
        fontColor: {
            default: android.graphics.Color.WHITE,
            ok: android.graphics.Color.GREEN,
            error: android.graphics.Color.RED
        },
        fontSize: {
            s40: 40,
            s50: 50
        },
        fontShadow: {
            s0: 0
        },
        frame: "waila.frame.default",
        popupPadding: 10,
    };

    constructor(private readonly colorUtils: ColorUtils) {
    }

    convert(from: JsonWailaStyle): WailaStyle {
        const version = from.version;
        if (version == undefined || version < JsonStyleConverter.MIN_VERSION || version > JsonStyleConverter.ACTUAL_VERSION) {
            throw new VersionNotSupportedException(version, JsonStyleConverter.MIN_VERSION, JsonStyleConverter.ACTUAL_VERSION)
        }

        const defaultValues = JsonStyleConverter.DEFAULT_VALUES;
        return {
            fontSize: {...defaultValues.fontSize, ...from.fontSize},
            fontShadow: {...defaultValues.fontShadow, ...from.fontShadow},
            fontColor: from.fontColor ? this.compileColors(from.fontColor) : defaultValues.fontColor,
            popupPadding: from.popupPadding ?? defaultValues.popupPadding,
            frame: from.frame ?? defaultValues.frame,
        };
    }

    private compileColors(original: JsonFontColors): FontColors {
        const compiled: Partial<FontColors> = {};
        for (const [key, value] of Object.entries(original)) {
            compiled[key] = this.colorUtils.compile(value as ColorValue);
        }

        return compiled as FontColors;
    }
}