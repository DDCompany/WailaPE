if (WailaConfig.extCropGrowth) {
//Отображение прогресса роста растения
    Waila.addGlobalExtension(function (id, data, elements, tile, yPos) {
        let growthStages = Waila.getGrowthStages(id);

        if (growthStages > -1) {
            elements["growthValue"] = {
                type: "text",
                text: Waila.translate("waila.growth", "Growth") + ": " + Math.floor(data / growthStages * 100) + "%",
                x: 200,
                y: yPos,
                font: StyleManager.getDefaultFont()
            };
            yPos += 60;
            Waila.requireHeight(20);
        }

        return yPos;
    });
}