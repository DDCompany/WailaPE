//Отображение прогресса роста растения
Waila.addGlobalExtension(function (id, data, elements, tile, height, yPos) {
    let growthStages = Waila.getGrowthStages(id);

    if (growthStages > -1) {
        elements["growthValue"] = {
            type: "text",
            text: Waila.translate("waila.growth", "Growth") + ": " + Math.floor(data / growthStages * 100) + "%",
            x: 200,
            y: yPos,
            font: {color: Color.WHITE, size: 40}
        };
        yPos += 60;
        height += 20;
        //if (blockData)
        //    height += 20;
    }

    return {height: height, yPos: yPos};
});