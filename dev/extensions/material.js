//Отображение информации о материале, уровне ломания, возможности сломать данный блок
Waila.addGlobalExtension(function (id, data, elements, tile, yPos) {
    let blockData = ToolAPI.getBlockData(id);

    if (blockData) {
        elements["materialName"] = {
            type: "text",
            text: Waila.translate("waila.material", "Material") + ": " + blockData.material.name,
            x: 200,
            y: yPos,
            font: {color: Color.WHITE, size: 40}
        };
        yPos += 60;
        elements["materialLevel"] = {
            type: "text",
            text: Waila.translate("waila.level", "Level") + ": " + blockData.level,
            x: 200,
            y: yPos,
            font: {color: Color.WHITE, size: 40}
        };
        yPos += 60;
        let validTool = Waila.isValidTool(blockData.material.name, blockData.level);
        elements["isHarvestable"] = {
            type: "text",
            text: (validTool ? "✔" : "✖") + " " + Waila.translate("waila.harvestable", "Currently Harvestable"),
            x: 200,
            y: yPos,
            font: {
                color: validTool ? Color.GREEN : Color.RED,
                size: 40,
            }
        };
        Waila.requireHeight(60);
    }

    return yPos;
});