const colorUtils = new ColorUtils() as ColorUtils;
const styleConverter = new JsonStyleConverter(colorUtils);
const stylesLoader = new JsonStylesLoader(styleConverter);
const stylesRegistry = new WailaStylesRegistry(stylesLoader) as StylesRegistry;
stylesRegistry.loadFromJson(`${__dir__}styles`)

const extensionsRegistry = new WailaExtensionsRegistry();
const config: WailaConfig = new WailaConfigImpl(__config__, stylesRegistry);
const openedUiManager = new OpenedUiManagerImpl();
const popupRenderer = new PopupRendererImpl(config, openedUiManager);

extensionsRegistry.register(PointedType.ENTITY, (target, builder) => {
    builder.text(`Entity: ${target.entity}`);
});

extensionsRegistry.register(PointedType.ENTITY, (target, builder) => {
    const compoundTag = Entity.getCompoundTag(target.entity);
    const customName = compoundTag.getString("CustomName");
    const age = compoundTag.getInt("Age");
    builder
        .text(`Age: ${age}`)
        .text(`Name: ${customName}`);
});

extensionsRegistry.register(PointedType.BLOCK, (target, builder) => {
    const block = target.block;
    builder.text(Item.getName(block.id, block.data));
    builder.text(`BlockId: ${block.id}`);
});

extensionsRegistry.register(PointedType.ANY, (target, builder) => {
    builder.text(target instanceof PointedEntity ? "Is Entity" : "Is Block");
});

Callback.addCallback("NativeCommand", (command) => {
    if (command.startsWith("/wcs")) {
        const styleName = command.split(" ")[1];
        const style = stylesRegistry.getByName(styleName);
        if (style) {
            config.setStyle(styleName);
            Debug.message(JSON.stringify(config.selectedStyle));
            Debug.message(`Style set to ${styleName}`);
        } else {
            Debug.message(`Style ${styleName} not found`);
        }

        Game.prevent();
    }
});

Callback.addCallback("LocalTick", () => {
    if (World.getThreadTime() % 20 !== 0) {
        return;
    }

    const pointed = Player.getPointed();
    let builder: PopupContentBuilder;
    const anyExtensions = extensionsRegistry.getByType(PointedType.ANY);

    if (pointed.entity !== -1) {
        builder = new PopupContentBuilder(VanillaItemID.spawn_egg, 0);
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
        const blockSource = BlockSource.getDefaultForActor(Player.get());
        const pointedBlock = blockSource.getBlock(pointed.pos.x, pointed.pos.y, pointed.pos.z);
        if (pointedBlock.id !== 0) {
            builder = new PopupContentBuilder(pointedBlock.id, pointedBlock.data);
            const blockExtensions = extensionsRegistry.getByType(PointedType.BLOCK);
            const target = new ICPointedBlock(blockSource, pointed.pos.x, pointed.pos.y, pointed.pos.z);

            for (const extension of anyExtensions) {
                extension(target, builder);
            }

            for (const extension of blockExtensions) {
                extension(target, builder);
            }
        }
    }

    if (builder) {
        popupRenderer.onContentChanged(builder.build());
    }
});

Debug.big(stylesRegistry.all);