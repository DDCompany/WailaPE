type ExtensionsByType = {
    [PointedType.ANY]: ExtensionFunc<PointedTarget>[],
    [PointedType.BLOCK]: BlockExtensionFunc[],
    [PointedType.ENTITY]: EntityExtensionFunc[],
}

class WailaExtensionsRegistry implements ExtensionsRegistry {
    private readonly extensions: ExtensionsByType;

    constructor() {
        this.extensions = {
            [PointedType.ANY]: [],
            [PointedType.BLOCK]: [],
            [PointedType.ENTITY]: [],
        };
    }

    register(type: PointedType.ANY, func: ExtensionFunc<PointedTarget>): void;
    register(type: PointedType.ENTITY, func: EntityExtensionFunc): void;
    register(type: PointedType.BLOCK, func: BlockExtensionFunc): void;
    register(type: PointedType.ANY | PointedType.ENTITY | PointedType.BLOCK, func: ExtensionFunc<PointedTarget> | EntityExtensionFunc | BlockExtensionFunc): void {
        const registered = this.extensions[type];
        if (registered.indexOf(func) !== -1) {
            throw new java.lang.IllegalArgumentException("Extension already registered")
        }

        registered.push(func);
    }

    getByType(type: PointedType.ANY): ExtensionFunc<PointedTarget>[];
    getByType(type: PointedType.ENTITY): EntityExtensionFunc[];
    getByType(type: PointedType.BLOCK): BlockExtensionFunc[];
    getByType(type: PointedType.ANY | PointedType.ENTITY | PointedType.BLOCK): ExtensionFunc<PointedTarget>[] | EntityExtensionFunc[] | BlockExtensionFunc[] {
        return this.extensions[type];
    }
}