type StyleChangeListener = (style: WailaStyle) => void;

interface WailaConfig {
    activePosition: PopupPosition;
    selectedStyle: WailaStyle;

    setStyle(name: string): void;

    addStyleChangeListener(listener: StyleChangeListener): void;

    removeStyleChangeListener(listener: StyleChangeListener): void;
}