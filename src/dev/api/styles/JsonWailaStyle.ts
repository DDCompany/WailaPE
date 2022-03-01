interface JsonFontColors {
    default: ColorValue;
    ok: ColorValue;
    error: ColorValue;
}

interface JsonWailaStyle extends WailaStyle {
    version?: number,
    fontColor: JsonFontColors;
}