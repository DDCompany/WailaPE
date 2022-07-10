enum PopupNodeType {
    TEXT,
}

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

type TextNode = TextOptions & { type: PopupNodeType.TEXT };

type PopupContent = TextNode[];

class PopupContentBuilder {
    private readonly content: PopupContent;

    constructor() {
        this.content = [];
    }

    text(options: TextOptions): this {
        this.content.push({type: PopupNodeType.TEXT, ...options});
        return this;
    }

    build(): PopupContent {
        return this.content;
    }
}