if(WailaConfig.extModName) {
    const BlockList = {
        modById: {},

        init: function () {
            let classLoader = UI.getContext().getClass().getClassLoader();

            //Получаем текст на экране загрузки
            let LoadingUI = java.lang.Class.forName("zhekasmirnov.launcher.ui.LoadingUI", true, classLoader).newInstance();
            let bgViewDrawableField = LoadingUI.getClass().getDeclaredField("backgroundViewDrawable");
            bgViewDrawableField.setAccessible(true);

            this.bgViewDrawable = bgViewDrawableField.get(LoadingUI);
            this.textField = this.bgViewDrawable.getClass().getDeclaredField("text");
            this.textField.setAccessible(true);

            //Получаем ArrayList, в котором находятся загруженные моды
            let ModLoader = java.lang.Class.forName("zhekasmirnov.launcher.mod.build.ModLoader", true, classLoader).newInstance().instance;
            this.modsList = ModLoader.modsList;
        },

        /**
         * Вызывается при регистрации айди блока через перезаписанный метод IDRegistry.genBlockID
         * @param stringId строковый айди блока
         */
        onIDRegistered: function (stringId) {
            //Получаем текст на загрузочном экране (Running Mods: 1/10) и извлекаем индекс загружаемого в данный момент мода
            let loadingText = String(this.textField.get(this.bgViewDrawable));
            let modId = parseInt(loadingText.substr(14, loadingText.length).split("/")[0]) - 1;
            this.modById[BlockID[stringId]] = this.modsList.get(modId).getName();
        },

        /**
         * @param id айди блока
         * @returns {string} мод, которому принадлежит айди переданного блока
         */
        getModName: function (id) {
            return this.modById[id] || "Minecraft";
        }
    };

    BlockList.init();

    let _genBlockID = IDRegistry.genBlockID;
    IDRegistry.genBlockID = function (a) {
        _genBlockID(a);
        BlockList.onIDRegistered(a);
    };
}