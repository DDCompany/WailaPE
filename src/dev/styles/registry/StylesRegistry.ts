interface StylesRegistry {
    all: Record<string, WailaStyle>;

    register(name: string, style: WailaStyle): void;

    registerAll(styles: Record<string, WailaStyle>): void;

    getByName(name: string): Nullable<WailaStyle>;
}