//Отображение количества энергии в TileEntity
Waila.addGlobalExtension(function (id, data, elements, tile, height, yPos) {
    if (tile && tile.data.energy >= 0) {
        Waila.addBar({
            elements: elements,
            progress: tile.data.energy,
            progressMax: tile.getEnergyStorage ? tile.getEnergyStorage() : -1,
            prefix: "energy",
            yPos: yPos
        });

        yPos += 80;
        height += 30;
    }

    return {height: height, yPos: yPos};
});