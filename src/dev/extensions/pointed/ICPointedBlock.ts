class ICPointedBlock implements PointedBlock {
    constructor(
        readonly blockSource: BlockSource,
        readonly x: number,
        readonly y: number,
        readonly z: number,
    ) {
    }

    getBlock(): Tile {
        return this.blockSource.getBlock(this.x, this.y, this.z);
    }

    getTileEntity(): TileEntity {
        return World.getTileEntity(this.x, this.y, this.z, this.blockSource);
    }
}