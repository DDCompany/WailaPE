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