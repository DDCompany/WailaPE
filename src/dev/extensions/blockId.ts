if (WailaConfig.extBlockIdData) {
    //Отображение id и data блока
    Waila.addGlobalExtension(function (id, data, elements, tile, yPos) {
        elements["blockId"] = {
            type: "text",
            text: "ID: " + id,
            x: 200,
            y: yPos,
            font: StyleManager.getDefaultFont()
        };
        yPos += 60;

        elements["blockData"] = {
            type: "text",
            text: "Data: " + data,
            x: 200,
            y: yPos,
            font: StyleManager.getDefaultFont()
        };
        yPos += 60;

        Waila.requireHeight(40);
        return yPos;
    });
}