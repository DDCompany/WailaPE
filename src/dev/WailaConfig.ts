const WailaConfig = {
    checkTime: +__config__.getNumber("checkTime"),
    style: __config__.getString("style"),
    position: {
        classic: {
            x: +__config__.getNumber("position.classic.x"),
            y: +__config__.getNumber("position.classic.y"),
        },
        default: {
            x: +__config__.getNumber("position.default.x"),
            y: +__config__.getNumber("position.default.y"),
        },
    },

    extCropGrowth: __config__.getBool("extensions.cropGrowth"),
    extDebugTiles: __config__.getBool("extensions.debugTiles"),
    extEnergy: __config__.getBool("extensions.energy"),
    extMaterial: __config__.getBool("extensions.material"),
    extBlockIdData: __config__.getBool("extensions.blockIdData")
};