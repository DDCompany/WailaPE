interface PointedTarget {
}

abstract class PointedEntity {
    abstract entity: number;
}

abstract class PointedBlock {
    abstract x: number;
    abstract y: number;
    abstract z: number;
    abstract block: Tile;
    abstract tileEntity: TileEntity;
    abstract blockSource: BlockSource;
}