const ItemIconSource2: typeof ItemIconSource = ModAPI.requireGlobal("com.zhekasmirnov.innercore.api.mod.ui.icon.ItemIconSource");

class PopupRendererImpl implements PopupRenderer {
    private readonly window = new UI.Window();
    private displayedContent: Nullable<PopupContent>;
    private texture: Nullable<UI.FrameTexture>;

    private icon: Nullable<android.graphics.Bitmap>;
    private cachedIconInfo: { id: number, data: number, size: number };

    constructor(
        private readonly config: WailaConfig,
        private readonly openedUiManager: OpenedUiManager,
    ) {
        this.cachedIconInfo = {id: -1, data: -1, size: -1};
        this.displayedContent = null;
        this.icon = null;
        this.window = new UI.Window({
            location: {
                x: 0,
                y: 0,
                width: 1000,
                height: UI.getScreenHeight(),
            },
            drawing: [
                {type: "color", color: android.graphics.Color.TRANSPARENT},
            ],
            elements: {
                content: {
                    type: "custom",
                    x: 0,
                    y: 0,
                    onDraw: (self, canvas, scale) => {
                        try {
                            this.draw(canvas, scale);
                        } catch (e) {
                            alert(e);
                        }
                    }
                }
            },
        });
        this.window.setAsGameOverlay(false);
        this.window.setTouchable(false);
        this.window.setDynamic(false);

        openedUiManager.setChangeListener(canShow => {
            if (!canShow && this.window.isOpened()) {
                this.window.close();
            }
        });

        this.invalidateStyle = this.invalidateStyle.bind(this);
        this.invalidateStyle(config.selectedStyle);
        config.addStyleChangeListener(this.invalidateStyle);
    }

    onContentChanged(content: Nullable<PopupContent>): void {
        if (content === null || content.nodes.length === 0 || !this.openedUiManager.canPopupShow) {
            if (this.window.isOpened()) {
                this.window.close();
            }

            return;
        } else if (!this.window.isOpened()) {
            this.window.open();
        }

        this.displayedContent = content;
        this.window.invalidateElements(false);
    }

    recycle() {
        this.icon?.recycle();
        this.config.removeStyleChangeListener(this.invalidateStyle);
    }

    private draw(canvas: android.graphics.Canvas, scale: number) {
        const content = this.displayedContent;
        if (content === null) {
            return;
        }
        const itemToContentPadding = 10 * scale;
        const iconSize = 55 * scale;
        this.invalidateIconIfNeeded(content, iconSize);

        const innerPadding = config.selectedStyle.popupPadding * scale;
        const popupWidth = 300 * scale + innerPadding * 2;
        const contentLeftPadding = innerPadding + iconSize + itemToContentPadding;
        const popupHeight = Math.max(
            iconSize + innerPadding * 2,
            content.nodes.reduce((acc, node) => acc + node.measure(scale), 0) + innerPadding * 2,
        );

        const pos = config.activePosition.calculate(
            1000,
            UI.getScreenHeight() * scale,
            popupWidth,
            popupHeight
        );

        //draw background
        const textureRect = new android.graphics.RectF(
            pos.x,
            pos.y,
            pos.x + popupWidth,
            pos.y + popupHeight,
        );
        this.texture.draw(canvas, textureRect, scale * 2, config.selectedStyle.frame.fill, null);
        if (this.icon) {
            canvas.drawBitmap(this.icon, pos.x + innerPadding, pos.y + innerPadding, null);
        }

        //draw content
        const fromX = pos.x + contentLeftPadding;
        let fromY = pos.y + innerPadding;
        for (const element of content.nodes) {
            element.draw(canvas, fromX, fromY, scale);
            fromY += element.measure(scale);
        }
    }
    private invalidateIconIfNeeded(content: PopupContent, size: number) {
        const cached = this.cachedIconInfo;
        const icon = content.icon;
        if (cached.id === icon.id && cached.data === icon.data && cached.size === size) {
            return;
        }

        this.icon = ItemIconSource2.instance.getScaledIcon(icon.id, icon.data, size);
        this.cachedIconInfo = {id: icon.id, data: icon.data, size};
    }

    private invalidateStyle(style: WailaStyle) {
        this.texture = UI.FrameTextureSource.get(style.frame.texture);
    }
}