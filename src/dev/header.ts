const colorUtils = new ColorUtils();
const styleConverter = new JsonStyleConverter(colorUtils);
const stylesLoader = new JsonStylesLoader(styleConverter);
const stylesRegistry = new WailaStylesRegistry();
const extensionsRegistry = new WailaExtensionsRegistry();

extensionsRegistry.register(PointedType.ENTITY, (target, builder) => {
    builder.text({value: `Entity: ${target.entity}`});
});

extensionsRegistry.register(PointedType.BLOCK, (target, builder) => {
    const block = target.getBlock();
    builder.text({value: Item.getName(block.id, block.data)});
    builder.text({value: `BlockId: ${block.id}`});
});

extensionsRegistry.register(PointedType.ANY, (target, builder) => {
    builder.text({value: target instanceof PointedEntity ? "Is Entity" : "Is Block"});
});

Callback.addCallback("DestroyBlock", (coords, block, player) => {
    const anyExtensions = extensionsRegistry.getByType(PointedType.ANY);
    const blockExtensions = extensionsRegistry.getByType(PointedType.BLOCK);
    const target = new ICPointedBlock(BlockSource.getDefaultForActor(player), coords.x, coords.y - 1, coords.z);
    const builder = new DummyContentBuilder();

    for (const extension of anyExtensions) {
        extension(target, builder);
    }

    for (const extension of blockExtensions) {
        extension(target, builder);
    }

    Game.tipMessage(builder.build());
});

stylesRegistry.registerAll(stylesLoader.load(`${__dir__}styles`));
Debug.big(stylesRegistry.all);