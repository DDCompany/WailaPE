interface OpenedUiManager {
    canPopupShow: boolean;

    setChangeListener(callback: (canShow: boolean) => void): void;
}

class OpenedUiManagerImpl implements OpenedUiManager {
    private static permittedUis: string[] = [
        "hud_screen",
        "in_game_play_screen",
    ];

    private isPermittedNativeUi: boolean;
    private readonly openedWindows: (UI.Window | UI.WindowGroup)[];
    private changeListener: ((canShow: boolean) => void) | null;
    private canShowLast: boolean | null;

    constructor() {
        this.openedWindows = [];
        this.isPermittedNativeUi = false;
        this.canShowLast = null;

        Callback.addCallback("NativeGuiChanged", screenName => {
            this.onNativeUiChanged(screenName);
        });

        Callback.addCallback("ContainerOpened", (container, window) => {
            //The check was in previous versions of the mod. I don't know if it's still relevant.
            if (!window) {
                return;
            }

            this.onWindowOpened(window);
        });

        Callback.addCallback("ContainerClosed", (container, window) => {
            this.onWindowClosed(window);
        });
    }

    get canPopupShow() {
        return this.isPermittedNativeUi && this.openedWindows.length === 0;
    }

    setChangeListener(listener: (canShow: boolean) => void) {
        this.changeListener = listener;
    }

    private onNativeUiChanged(screenName: string) {
        this.isPermittedNativeUi = OpenedUiManagerImpl.permittedUis.indexOf(screenName) !== -1;
        this.notifyChange();
    }

    private onWindowOpened(window: UI.Window | UI.WindowGroup) {
        if (!(window as UI.Window).isNotFocusable) { //WindowGroup
            this.openedWindows.push(window);
        } else if (!(window as any as UI.Window).isNotFocusable()) {
            this.openedWindows.push(window);
        }

        this.notifyChange();
    }

    private onWindowClosed(window: UI.Window | UI.WindowGroup) {
        const index = this.openedWindows.indexOf(window);
        if (index !== -1) {
            this.openedWindows.splice(index, 1);
            this.notifyChange();
        }
    }

    private notifyChange() {
        if (this.changeListener && (this.canShowLast === null || this.canPopupShow !== this.canShowLast)) {
            this.changeListener(this.canPopupShow);
            this.canShowLast = this.canPopupShow;
        }
    }
}