if (WailaConfig.extDebugTiles) {
    Waila.addGlobalExtension(function (id, data, elements, tile, yPos) {
        if (tile) {
            for (let i in tile.data) {
                elements["tileData" + i] = {
                    type: "text",
                    text: i + ": " + tile.data[i],
                    x: 200,
                    y: yPos,
                    font: StyleManager.getDefaultFont()
                };
                yPos += 60;
                Waila.requireHeight(20);
            }
        }

        return yPos;
    });
}