interface FontSizes {
    s40: number;
    s50: number;
}

interface FontColors {
    default: number;
    ok: number;
    error: number;
}

interface FontShadow {
    s0: number;
}

interface WailaStyle {
    fontSize: FontSizes;
    fontColor: FontColors;
    fontShadow: FontShadow;
    popupPadding: number;
    frame: string;
}

interface JsonFontColors {
    default: ColorValue;
    ok: ColorValue;
    error: ColorValue;
}

interface JsonWailaStyle extends WailaStyle {
    version?: number,
    fontColor: JsonFontColors;
}