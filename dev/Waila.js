const OPENED_WINDOWS = [];

const Waila = {
    /**
     * Контейнер для окна
     */
    container: new UI.Container(),
    /**
     * Имеет значение false, если текущий экран не hud_screen и не in_game_play_screen
     */
    validNativeUI: false,
    /**
     * Объект, который хранит количество стадий роста у определённых растений. Ключом является айди блока.
     */
    growthStages: {},
    /**
     * Объект, который хранит функции, добавляющие кастомную информацию в всплывающее окно. Ключом является айди блока
     */
    extensions: {},
    /**
     * Массив, который хранит функции, добавляющие кастомную информацию в всплывающее окно.
     */
    globalExtensions: [],
    /**
     * Высота всплывающего окна
     */
    height: 35,

    /**
     * Инициализация окна и установка количества стадий роста для ванильных растений
     */
    init: function () {
        this.setGrowthStages(59, 7);
        this.setGrowthStages(141, 7);
        this.setGrowthStages(142, 7);
        this.setGrowthStages(244, 7);

        this.popupWindow = new UI.Window({
            location: {
                x: WailaConfig.x,
                y: WailaConfig.y,
                width: 300,
                height: this.height
            },

            drawing: [
                {type: "color", color: Style.COLOR}
            ],
            elements: {
                "frame": {
                    type: "frame",
                    x: 0,
                    y: 0,
                    z: -1,
                    width: 1000,
                    height: 300,
                    bitmap: Style.TEX_FRAME,
                    scale: 5,
                },
                "slot": {
                    type: "slot",
                    x: 10,
                    y: 10,
                    size: 210,
                    bitmap: "_default_slot_empty",
                    isTransparentBackground: true,
                    visual: true
                },

                "name": {
                    type: "text",
                    text: "",
                    x: 200,
                    y: 30,
                    font: {color: Style.DEF, size: 50}
                }
            }
        });

        this.popupWindow.setAsGameOverlay(true);
    },

    /**
     * @returns {boolean} может ли быть открыто окно Waila в данный момент
     */
    mayPopupShow: function () {
        return Waila.validNativeUI && OPENED_WINDOWS.length === 0
    },

    /**
     * Возвращает локализированную строку
     * @param key ключ
     * @param defaultValue стандартное значение, если локализация не задана
     * @returns {String} локализованная строка
     */
    translate: function (key, defaultValue) {
        let translated = Translation.translate(key);
        if (translated !== key)
            return translated;

        return defaultValue;
    },

    /**
     * Добавление информации о блоке в окно
     * @param id айди блока
     * @param data дата блока
     * @param elements объект с элементами окна
     * @returns {number} необходимая высота окна
     */
    buildBlockInfo: function (id, data, elements) {
        let y = 100;
        let tile = World.getTileEntity(this.blockPos.x, this.blockPos.y, this.blockPos.z);

        //Добавляем информацию из Extensions
        let extension = this.extensions[id];
        if (extension) {
            let info = extension(id, data, elements, tile, y);
            if (info) {
                y = info;
            }
        }

        //Добавляем информацию из Global Extensions
        for (let i in this.globalExtensions) {
            let info = this.globalExtensions[i](id, data, elements, tile, y);
            if (info) {
                y = info;
            }
        }
    },

    /**
     * Добавляем информацию о сущности в окно
     * @param entity сущность
     * @param type айди типа сущности
     * @param elements объект с элементами окна
     * @returns {number} необходимая высота окна
     */
    buildEntityInfo: function (entity, type, elements) {
        elements["entityType"] = {
            type: "text",
            text: Waila.translate("waila.entity_type", "Entity Type") + ": " + type,
            x: 200,
            y: 100,
            font: {color: Style.DEF, size: 40}
        };

        if (type < 64 || type > 103) {
            this.addBar({
                elements: elements,
                progress: Entity.getHealth(entity),
                progressMax: Entity.getMaxHealth(entity),
                prefix: "health"
            });
        }
    },

    /**
     * Показ всплывающего окна
     * @param block блок. Объект, который содержит поля id и data
     * @param entity сущность
     * @param type тип сущности
     */
    showPopup: function (block, entity, type) {
        let elements = this.popupWindow.getContent().elements;

        for (let i in elements) {
            if (i !== "slot" && i !== "name" && i !== "frame")
                elements[i] = null;
        }

        let slot = this.container.getSlot("slot");
        slot.count = 1;

        if (block) {
            slot.id = block.id;
            slot.data = block.data;

            let name = Item.getName(block.id, block.data);
            elements["name"].text = name.length <= 18 ? name : name.substr(0, 18) + "...";

            this.buildBlockInfo(block.id, block.data, elements);
        } else {
            slot.id = 383;
            slot.data = type;

            elements["name"].text = this.translate("waila.entity", "Entity");

            this.buildEntityInfo(entity, type, elements);
        }

        this.height = Math.max(this.height, MINIMAL_WINDOW_HEIGHT);

        if (this.lastHeight !== this.height || !this.container.isOpened()) {
            let location = this.popupWindow.getLocation();

            location.setSize(300, this.height);
            this.lastHeight = this.height;
            elements["frame"].height = location.globalToWindow(this.height);

            UI.getContext().runOnUiThread(new java.lang.Runnable({
                run: function () {
                    Waila.container.openAs(Waila.popupWindow);
                }
            }));
        }

        this.height = 35;
    },

    /**
     * Добавление шкалы в всплывающее окно
     * @param obj объект, который может хранить следующие поля:
     * elements(обязательное поле)  - список элементов, куда необходимо добавить шкалу,
     * prefix(обязательное поле)    - префикс для элементов, имеет значение, если используются несколько шкал,
     * progress                     - текущее значение прогресса,
     * progressMax                  - максимальное значение прогресса,
     * yPos                         - позиция шкалы по оси Y,
     * barBgTexture                 - текстура заполненной шкалы,
     * fontColor                    - цвет текста
     */
    addBar: function (obj) {
        let elements = obj.elements;
        let prefix = obj.prefix;

        if (!elements || !prefix) {
            Logger.Log("Elements or prefix property for Waila bar is not set", "ERROR");
            return;
        }


        obj.progress = obj.progress || 0;
        obj.barTexture = obj.barTexture || "waila_bar";
        obj.barBgTexture = obj.barBgTexture || Style.TEX_BAR_FRAME;
        let yPos = obj.yPos || 160;

        elements[prefix + "Bar"] = {
            type: "scale",
            x: 200,
            y: yPos,
            value: obj.progressMax < 0 ? 1 : obj.progress / obj.progressMax,
            bitmap: obj.barTexture,
            scale: 3
        };
        elements[prefix + "BarBg"] = {
            type: "image",
            bitmap: obj.barBgTexture,
            x: 200,
            y: yPos,
            scale: 3
        };
        elements[prefix] = {
            type: "text",
            text: obj.progress + "/" + obj.progressMax,
            x: 215,
            y: yPos + 8,
            font: {color: obj.fontColor || Color.WHITE, size: 40}
        };
    },

    /**
     * Можно ли сломать блок инструментом в руке
     * @param material название материала блока
     * @param blockLevel уровень ломания блока
     * @returns {Boolean} можн ли сломать блок
     */
    isValidTool: function (material, blockLevel) {
        if (material === "unbreaking")
            return false;

        if (!blockLevel)
            return true;

        let toolData = ToolAPI.getToolData(this.lastTool);
        return toolData && toolData.blockMaterials && toolData.blockMaterials[material] && toolData.toolMaterial.level >= blockLevel;
    },

    /**
     * Возвращает количество стадий роста у растения
     * @param id айди блока
     * @returns {Number} количество стадий. -1, если блок не является растением.
     */
    getGrowthStages: function (id) {
        let stages = this.growthStages[id];
        if (stages)
            return stages;

        if (CropRegistry.isCrop(id))
            return 2;

        return -1;
    },

    /**
     * Установка количества стадий роста для растения
     * @param blockId айди блока
     * @param stages количество стадий
     */
    setGrowthStages: function (blockId, stages) {
        this.growthStages[blockId] = stages;
    },

    /**
     * Добавление расширения для определённого блока
     * @param id айди блока
     * @param func функция, вызываемая при отрисовки окна. Передаваемые аргументы: id, data, elements, tile, height, yPos
     */
    addExtension: function (id, func) {
        if (!id) {
            Logger.Log("Block id is not correct (Extension Registration)", "ERROR");
            return;
        }

        if (!func) {
            Logger.Log("Function is not correct (Extension Registration)", "ERROR");
            return;
        }

        this.extensions[id] = func;
    },

    /**
     * Добавление расширения для всех блоков
     * @param func функция, вызываемая при отрисовки окна. Передаваемые аргументы: id, data, elements, tile, height, yPos
     */
    addGlobalExtension: function (func) {
        if (!func) {
            Logger.Log("Function is not correct (Global Extension Registration)", "ERROR");
            return;
        }

        this.globalExtensions.push(func);
    },

    /**
     * Увеличивает необходимую для отображения элементов высоту всплывающего окна
     * @param value число, на которое необходимо увеличить высоту
     */
    requireHeight: function (value) {
        this.height += value;
    }
};

Waila.init();

Callback.addCallback("tick", function () {
    if (Waila.mayPopupShow()) {
        if (World.getThreadTime() % WailaConfig.checkTime === 0) {
            let pointed = getPointed();
            let pos = pointed.pos;
            let lastPos = Waila.blockPos;
            let entity = Waila.pointedEntity;
            Waila.lastTool = Player.getCarriedItem().id;

            if (lastPos && lastPos.x === pos.x && lastPos.y === pos.y && lastPos.z === pos.z) {
                return;
            }

            if (entity !== -1 && pointed.entity === entity) {
                return;
            }

            Waila.blockPos = pos;
            entity = Waila.pointedEntity = pointed.entity;

            if (pos.x !== 0 || pos.y !== 0 || pos.z !== 0) {
                let block = World.getBlock(pos.x, pos.y, pos.z);
                if (block.id > 255) {
                    block = {
                        id: 255 - block.id,
                        data: block.data
                    };
                }
                Waila.showPopup(block);
                return;
            }

            let type = Entity.getType(entity);
            if (entity !== -1 && type !== 71) {
                Waila.showPopup(null, entity, type);
                return;
            }

            Waila.container.close();
        }
    } else if (Waila.container.isOpened()) {
        Waila.container.close();
    }
});

Callback.addCallback("NativeGuiChanged", function (screenName) {
    Waila.validNativeUI = screenName === "hud_screen" || screenName === "in_game_play_screen"
});

Callback.addCallback("ContainerOpened", function (container, window) {
    if (!window.equals(Waila.popupWindow))
        OPENED_WINDOWS.push(window);
});

Callback.addCallback("ContainerClosed", function (container, window) {
    let index = OPENED_WINDOWS.indexOf(window);
    if (index !== -1)
        OPENED_WINDOWS.splice(index, 1);
});