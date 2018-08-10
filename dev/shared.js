ModAPI.registerAPI("WailaAPI", {

    Waila: Waila,
    WailaConfig: WailaConfig,
    Style: Style,
    StyleManager: StyleManager,
    BlockList: BlockList,

    requireGlobal: function (command) {
        return eval(command);
    }

});
Logger.Log("Waila API shared with name WailaAPI", "API");