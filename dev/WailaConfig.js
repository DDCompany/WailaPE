const WailaConfig = {
    checkTime: __config__.getNumber("checkTime"),
    tilesData: __config__.getBool("tilesData"),
    x: __config__.getNumber("x"),
    y: __config__.getNumber("y"),
    style: __config__.getString("style"),

    extModName: __config__.getBool("extensions.modName")
};