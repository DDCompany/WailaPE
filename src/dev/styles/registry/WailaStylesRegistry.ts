class WailaStylesRegistry implements StylesRegistry {
    private readonly styles: Record<string, WailaStyle>;

    constructor(private readonly jsonLoader: FileStylesLoader) {
        this.styles = {};
    }

    get all(): Readonly<Record<string, WailaStyle>> {
        return this.styles;
    }

    register(name: string, style: WailaStyle): void {
        if (this.getByName(name)) {
            throw new java.lang.IllegalArgumentException(`Style already registered: ${name}`);
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

    loadFromJson(path: string): void {
        const styles = this.jsonLoader.load(path);
        this.registerAll(styles);
    }
}