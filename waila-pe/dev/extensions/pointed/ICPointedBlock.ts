class ICPointedBlock implements PointedBlock {
    constructor(
        readonly blockSource: BlockSource,
        readonly x: number,
        readonly y: number,
        readonly z: number,
    ) {
    }

    get block(): Tile {
        return this.blockSource.getBlock(this.x, this.y, this.z);
    }

    get tileEntity(): Nullable<TileEntity> {
        return World.getTileEntity(this.x, this.y, this.z, this.blockSource);
    }
}