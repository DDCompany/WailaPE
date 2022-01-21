if (WailaConfig.extEnergy) {
//Отображение количества энергии в TileEntity
    Waila.addGlobalExtension(function (id, data, elements, tile, yPos) {
        if (tile && tile.data.energy >= 0) {
            Waila.addBar({
                elements: elements,
                progress: tile.data.energy,
                progressMax: tile.getEnergyStorage ? tile.getEnergyStorage() : -1,
                prefix: "energy",
                yPos: yPos
            });

            yPos += 80;
            Waila.requireHeight(28);
        }

        return yPos;
    });
}