class JsonStyleConverter implements StyleConverter<JsonWailaStyle> {
    private static MIN_VERSION = 1;
    private static ACTUAL_VERSION = 1;
    private static DEFAULT_VALUES: WailaStyle = {
        popupPadding: 10,
        fontShadow: .6,
        frame: {
            texture: "waila.frame.default",
            fill: android.graphics.Color.TRANSPARENT,
        },
        fontColor: {
            default: android.graphics.Color.WHITE,
            ok: android.graphics.Color.GREEN,
            error: android.graphics.Color.RED,
        },
        fontSize: {
            title: 15,
            default: 12,
        },
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
            fontShadow: from.fontShadow ?? defaultValues.fontShadow,
            fontColor: from.fontColor ? this.compileColors(from.fontColor) : defaultValues.fontColor,
            popupPadding: from.popupPadding ?? defaultValues.popupPadding,
            frame: this.mergeFrames(from.frame),
        };
    }

    private mergeFrames(original?: JsonFrameStyle): FrameStyle {
        const defaultValues = JsonStyleConverter.DEFAULT_VALUES.frame;
        if (!original) {
            return defaultValues;
        }

        return {
            texture: original.texture ?? defaultValues.texture,
            fill: original.fill === undefined ? defaultValues.fill : this.colorUtils.compile(original.fill as ColorValue),
        }
    }

    private compileColors(original: JsonFontColors): FontColors {
        const compiled: Partial<FontColors> = {};
        for (const key in original) {
            const value = original[key];
            compiled[key] = this.colorUtils.compile(value as ColorValue);
        }

        return compiled as FontColors;
    }
}