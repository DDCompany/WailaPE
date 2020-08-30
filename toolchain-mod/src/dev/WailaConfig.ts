const WailaConfig = {
    checkTime: __config__.getNumber("checkTime") as unknown as number,
    x: __config__.getNumber("x"),
    y: __config__.getNumber("y"),
    style: __config__.getString("style"),

    extCropGrowth: __config__.getBool("extensions.cropGrowth"),
    extDebugTiles: __config__.getBool("extensions.debugTiles"),
    extEnergy: __config__.getBool("extensions.energy"),
    extMaterial: __config__.getBool("extensions.material"),
    extBlockIdData: __config__.getBool("extensions.blockIdData")
};