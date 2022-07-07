type ExtensionFunc<T extends PointedTarget> = (target: T, builder: PopupContentBuilder) => void
type EntityExtensionFunc = ExtensionFunc<PointedEntity>
type BlockExtensionFunc = ExtensionFunc<PointedBlock>

interface ExtensionsRegistry {
    register(type: PointedType.ANY, func: ExtensionFunc<PointedTarget>): void;

    register(type: PointedType.ENTITY, func: EntityExtensionFunc): void;

    register(type: PointedType.BLOCK, func: BlockExtensionFunc): void;

    getByType(type: PointedType.ANY): ExtensionFunc<PointedTarget>[]

    getByType(type: PointedType.ENTITY): EntityExtensionFunc[]

    getByType(type: PointedType.BLOCK): BlockExtensionFunc[]
}