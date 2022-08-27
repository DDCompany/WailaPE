class PopupPosition {
    private constructor(private readonly left: number | null,
                        private readonly top: number | null,
                        private readonly right: number | null,
                        private readonly bottom: number | null,
                        private readonly centerVertically: boolean,
                        private readonly centerHorizontally: boolean) {
    }

    static from(pos: JsonPopupPosition) {
        if ((pos.left !== undefined && pos.right !== undefined)
            || (pos.top !== undefined && pos.bottom !== undefined)) {
            throw new java.lang.IllegalArgumentException("Cannot specify both left and right or top and bottom");
        }

        if ((pos.left !== undefined || pos.right !== undefined) && pos.centerHorizontally) {
            throw new java.lang.IllegalArgumentException("Cannot specify horizontal constraints together with centerHorizontally");
        }

        if ((pos.top !== undefined || pos.bottom !== undefined) && pos.centerVertically) {
            throw new java.lang.IllegalArgumentException("Cannot specify vertical constraints together with centerVertically");
        }

        if (pos.top < 0 || pos.left < 0 || pos.right < 0 || pos.bottom < 0) {
            throw new java.lang.IllegalArgumentException("Position constraints must be positive");
        }

        Debug.big(pos);
        const right = pos.right ?? null;
        const left = pos.left ?? (right === null ? 0 : null);
        const bottom = pos.bottom ?? null;
        const top = pos.top ?? (bottom === null ? 0 : null);
        const centerVertically = pos.centerVertically || false;
        const centerHorizontally = pos.centerHorizontally || false;
        Debug.big({
            left,
            top,
            right,
            bottom,
            centerVertically,
            centerHorizontally,
        })
        return new PopupPosition(left, top, right, bottom, centerVertically, centerHorizontally);
    }

    calculate(screenWidth: number, screenHeight: number, popupWidth: number, popupHeight): AbsolutePosition {
        const x = this.calculatePos(this.left, this.right, this.centerHorizontally, screenWidth, popupWidth);
        const y = this.calculatePos(this.top, this.bottom, this.centerVertically, screenHeight, popupHeight);
        return {x, y};
    }

    private calculatePos(firstPadding: number | null,
                         secondPadding: number | null,
                         isCenter: boolean,
                         screenSize: number,
                         popupSize: number) {

        if (firstPadding !== null) {
            return firstPadding;
        }

        if (secondPadding !== null) {
            return screenSize - popupSize - secondPadding;
        }

        if (isCenter) {
            return (screenSize - popupSize) / 2;
        }

        throw new java.lang.IllegalStateException("Never reached");
    }
}