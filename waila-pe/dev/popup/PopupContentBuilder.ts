interface CustomNode {
    measure(scale: number): number;

    draw(canvas: android.graphics.Canvas, x: number, y: number, scale: number): void;

    [key: string]: any;
}

type PopupContent = {
    icon: {
        id: number,
        data: number,
    },
    nodes: CustomNode[];
};

//TODO
const font2 = new UI.Font({
    size: 12,
    color: android.graphics.Color.RED,
    cursive: true,
});

class PopupContentBuilder {
    private readonly content: PopupContent;

    constructor(iconId: number, iconData: number) {
        this.content = {
            icon: {
                id: iconId,
                data: iconData,
            },
            nodes: [],
        };
    }

    text(value: string): this {
        this.content.nodes.push({
            measure(scale) {
                //TODO
                // @ts-ignore
                return font2.getTextHeight(value, 0, 0, scale) * 1.15;
            },

            draw(canvas, x, y, scale) {
                //TODO
                // @ts-ignore
                font2.drawText(canvas, x, y + font2.getTextHeight(value, 0, 0, scale), value, scale);
            }
        })
        return this;
    }

    custom(options: CustomNode): this {
        this.content.nodes.push(options);
        return this;
    }

    build(): PopupContent {
        return this.content;
    }
}