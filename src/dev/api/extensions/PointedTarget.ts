interface PointedTarget {
}

abstract class PointedEntity {
    abstract entity: number;
}

abstract class PointedBlock {
    abstract x: number;
    abstract y: number;
    abstract z: number;
    abstract blockSource: BlockSource;

    abstract getBlock(): Tile;

    abstract getTileEntity(): TileEntity;
}