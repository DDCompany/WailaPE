const colorToIntCompiler = new AnyColorToIntCompiler();
const styleConverter = new JsonStyleConverter(colorToIntCompiler);
const stylesLoader = new JsonStylesLoader(styleConverter);
const stylesRepo = new WailaStylesRepository();

const contentBuilder = new DummyContentBuilder();
const extensionsRepo = new WailaExtensionsRepository();

extensionsRepo.register(PointedType.ENTITY, (target, builder) => {
    builder.text({value: `Entity: ${target.entity}`});
})

extensionsRepo.register(PointedType.BLOCK, (target, builder) => {
    const block = target.getBlock();
    builder.text({value: Item.getName(block.id, block.data)});
    builder.text({value: `BlockId: ${block.id}`});
})

extensionsRepo.register(PointedType.ANY, (target, builder) => {
    builder.text({value: target instanceof PointedEntity ? "Is Entity" : "Is Block"})
})

Callback.addCallback("DestroyBlock", (coords, block, player) => {
    const anyExtensions = extensionsRepo.getByType(PointedType.ANY);
    const blockExtensions = extensionsRepo.getByType(PointedType.BLOCK);
    const target = new ICPointedBlock(BlockSource.getDefaultForActor(player), coords.x, coords.y - 1, coords.z);
    const builder = new DummyContentBuilder();

    for (const extension of anyExtensions) {
        extension(target, builder);
    }

    for (const extension of blockExtensions) {
        extension(target, builder);
    }

    Game.tipMessage(builder.build())
})

stylesRepo.registerAll(stylesLoader.load(`${__dir__}styles`));
Debug.big(stylesRepo.getAll());