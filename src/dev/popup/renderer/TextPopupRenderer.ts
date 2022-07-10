class TextPopupRenderer implements PopupRenderer {
    onContentChanged(content: Nullable<PopupContent>) {
        if (content) {
            Game.tipMessage(this.renderToString(content));
        }
    }

    private renderToString(content: PopupContent) {
        return content.map(node => node.value).join("\n");
    }
}