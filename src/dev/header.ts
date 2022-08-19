const colorUtils = new ColorUtils() as ColorUtils;
const styleConverter = new JsonStyleConverter(colorUtils);
const stylesLoader = new JsonStylesLoader(styleConverter);
const stylesRegistry = new WailaStylesRegistry(stylesLoader) as StylesRegistry;
const extensionsRegistry = new WailaExtensionsRegistry();
const popupRenderer = new TextPopupRenderer();

extensionsRegistry.register(PointedType.ENTITY, (target, builder) => {
    builder.text({value: `Entity: ${target.entity}`});
});

extensionsRegistry.register(PointedType.ENTITY, (target, builder) => {
    const compoundTag = Entity.getCompoundTag(target.entity);
    const customName = compoundTag.getString("CustomName");
    const age = compoundTag.getInt("Age");
    builder
        .text({value: `Age: ${age}`})
        .text({value: `Name: ${customName}`});
});

extensionsRegistry.register(PointedType.BLOCK, (target, builder) => {
    const block = target.block;
    builder.text({value: Item.getName(block.id, block.data)});
    builder.text({value: `BlockId: ${block.id}`});
});

extensionsRegistry.register(PointedType.ANY, (target, builder) => {
    builder.text({value: target instanceof PointedEntity ? "Is Entity" : "Is Block"});
});

Callback.addCallback("LocalTick", () => {
    if (World.getThreadTime() % 20 !== 0) {
        return;
    }

    const pointed = Player.getPointed();
    const builder = new PopupContentBuilder();
    const anyExtensions = extensionsRegistry.getByType(PointedType.ANY);

    if (pointed.entity !== -1) {
        const entityExtensions = extensionsRegistry.getByType(PointedType.ENTITY);
        const target: PointedEntity = {
            entity: pointed.entity,
        };

        for (const extension of anyExtensions) {
            extension(target, builder);
        }

        for (const extension of entityExtensions) {
            extension(target, builder);
        }
    } else if (pointed.block) {
        const blockExtensions = extensionsRegistry.getByType(PointedType.BLOCK);
        const target = new ICPointedBlock(BlockSource.getDefaultForActor(Player.get()), pointed.pos.x, pointed.pos.y, pointed.pos.z);

        for (const extension of anyExtensions) {
            extension(target, builder);
        }

        for (const extension of blockExtensions) {
            extension(target, builder);
        }
    }

    popupRenderer.onContentChanged(builder.build());
});

stylesRegistry.loadFromJson(`${__dir__}styles`)
Debug.big(stylesRegistry.all);