class StyleManager {
    static styles = {};

    static add(name: string, obj: any) {
        this.styles[name] = obj;
    }

    static apply(name: string) {
        let style = this.styles[name];
        if (!style) {
            Logger.Log("Style " + name + " is not found! Default was applied", "ERROR");
            return;
        }

        for (let i in style) {
            Style[i] = style[i];
        }

        Logger.Log("Waila Style: " + name, "INFO");
    }

    static readFromFile() {
        let content = FileTools.ReadText(__dir__ + "json/styles.json");

        if (content) {
            let parsed = JSON.parse(content);

            for (let i in parsed) {
                let style = parsed[i];
                this.compileColor(style, "OK");
                this.compileColor(style, "NO");
                this.compileColor(style, "DEF");
                this.compileColor(style, "MOD");
                this.compileColor(style, "COLOR");
                style.TEXT_SHADOW = +style.TEXT_SHADOW || 0;

                this.styles[i] = style;
            }
        } else {
            Logger.Log("json/styles.json is not found!", "ERROR");
        }
    }

    static compileColor(obj: any, field: string) {
        let style = obj[field];

        if (!style) {
            return;
        }

        obj[field] = Color.argb(style.a || 255, style.r, style.g, style.b);
    }

    static getDefaultFont() {
        return {color: Style.DEF, size: 40, shadow: Style.TEXT_SHADOW};
    }

    static getTitleFont() {
        return {color: Style.DEF, size: 50, shadow: Style.TEXT_SHADOW};
    }
}

StyleManager.readFromFile();
StyleManager.apply(WailaConfig.style);