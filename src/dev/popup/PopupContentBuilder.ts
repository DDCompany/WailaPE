interface TextOptions {
    value: string;
    variant?: number;
    color?: number;
    shadow?: number;
    align?: number;
    bold?: boolean;
    cursive?: boolean;
    underline?: boolean;
}

interface PopupContentBuilder {
    text(options: TextOptions): this
}