interface FontSizes {
    title: number;
    default: number;
}

interface FontColors {
    default: number;
    ok: number;
    error: number;
}

interface FrameStyle {
    texture: string;
    fill: number;
}

interface WailaStyle {
    frame: FrameStyle;
    fontShadow: number;
    popupPadding: number;
    fontSize: FontSizes;
    fontColor: FontColors;
}

type JsonFontColors = { [key in keyof FontColors]: ColorValue };

interface JsonFrameStyle {
    texture: string;
    fill: ColorValue;
}

interface JsonWailaStyle extends WailaStyle {
    version?: number,
    fontColor: JsonFontColors;
    frame: JsonFrameStyle;
}