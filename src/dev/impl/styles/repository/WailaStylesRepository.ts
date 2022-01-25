class WailaStylesRepository implements StylesRepository<WailaStyle> {
    private readonly styles: Record<string, WailaStyle>;

    constructor() {
        this.styles = {};
    }

    register(name: string, style: WailaStyle): void {
        if (this.getByName(name)) {
            throw new Error(`Style already registered: ${name}`);
        }

        this.styles[name] = style;
    }

    registerAll(styles: Record<string, WailaStyle>): void {
        for (const name in styles) {
            this.register(name, styles[name]);
        }
    }

    getByName(name: string): Nullable<WailaStyle> {
        return this.styles[name] || null;
    }

    getAll(): Record<string, WailaStyle> {
        return this.styles;
    }
}