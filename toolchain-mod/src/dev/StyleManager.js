let StyleManager = {
    /**
     * Зарегистрированные стили. Ключом является название
     */
    styles: {},

    /**
     * Регистрация стиля
     * @param name название
     * @param obj объект описания
     */
    add: function (name, obj) {
        this.styles[name] = obj;
    },

    /**
     * Применение стандартного стиля
     */
    applyDefault: function () {
        Style = {};
        for (let i in DEFAULT_STYLE) {
            Style[i] = DEFAULT_STYLE[i];
        }
    },

    /**
     * Применение стиля
     * @param name название стиля
     */
    apply: function (name) {
        let style = this.styles[name];
        if (!style) {
            this.applyDefault();
            Logger.Log("Style " + name + " is not found! Default was applied", "ERROR");
            return;
        }

        this.applyDefault();

        for (let i in style) {
            Style[i] = style[i];
        }

        Logger.Log("Waila Style: " + name, "INFO");
    },

    /**
     * Чтение стилей из JSON файла
     */
    readFromFile: function () {
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

                this.styles[i] = style;
            }
        } else Logger.Log("json/styles.json is not found!", "ERROR");
    },

    compileColor: function (obj, field) {
        let style = obj[field];

        if (!style) {
            return;
        }

        obj[field] = Color.argb(style.a || 255, style.r, style.g, style.b);
    }
};

StyleManager.readFromFile();
StyleManager.apply(WailaConfig.style);