const NativeAPI = ModAPI.requireGlobal("com.zhekasmirnov.innercore.api.NativeAPI");

class WailaConfigImpl implements WailaConfig {
    activePosition: PopupPosition;
    selectedStyle: WailaStyle;

    private readonly position: Record<UiProfile, JsonPopupPosition> = {
        [UiProfile.DEFAULT]: {
            top: this.access("constraints.default.position.top"),
            left: this.access("constraints.default.position.left"),
            right: this.access("constraints.default.position.right"),
            bottom: this.access("constraints.default.position.bottom"),
            centerVertically: this.config.getBool("constraints.default.position.centerVertically"),
            centerHorizontally: this.config.getBool("constraints.default.position.centerHorizontally"),
        },
        [UiProfile.CLASSIC]: {
            top: this.access("constraints.classic.position.top"),
            left: this.access("constraints.classic.position.left"),
            right: this.access("constraints.classic.position.right"),
            bottom: this.access("constraints.classic.position.bottom"),
            centerVertically: this.config.getBool("constraints.classic.position.centerVertically"),
            centerHorizontally: this.config.getBool("constraints.classic.position.centerHorizontally"),
        }
    };

    private readonly styleChangeListeners: ((style: WailaStyle) => void)[] = [];

    constructor(private readonly config: Config,
                private readonly stylesRegistry: StylesRegistry) {
        this.setPosition(this.position[NativeAPI.getUiProfile()]);
        this.setStyle(this.config.getString("style"))
    }

    addStyleChangeListener(listener: StyleChangeListener): void {
        this.styleChangeListeners.push(listener);
    }

    removeStyleChangeListener(listener: StyleChangeListener) {
        const index = this.styleChangeListeners.indexOf(listener);
        if (index !== -1) {
            this.styleChangeListeners.splice(index, 1);
        }
    }

    setStyle(name: string) {
        const style = this.stylesRegistry.getByName(name);
        if (!style) {
            throw new java.lang.IllegalArgumentException(`Style ${name} not found`);
        }

        this.selectedStyle = style;
        this.config.set("style", name);
        this.styleChangeListeners.forEach(listener => listener(style));
    }

    private setPosition(pos: JsonPopupPosition) {
        this.activePosition = PopupPosition.from(pos);
    }

    private access(key: string): number | undefined {
        const value = parseInt(this.config.access(key) as string);
        return Number.isNaN(value) ? undefined : value;
    }
}