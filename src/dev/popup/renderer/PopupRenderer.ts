interface PopupRenderer {
    onContentChanged(content: Nullable<PopupContent>): void;

    recycle(): void;
}