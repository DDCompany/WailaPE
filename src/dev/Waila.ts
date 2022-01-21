const OPENED_WINDOWS = [];

interface BarDescription {
    elements: UI.ElementSet,
    prefix: string,
    progress?: number,
    progressMax?: number,
    yPos?: number,
    barTexture?: string,
    barBgTexture?: string
    fontColor?: number
}

type T_EXTENSION = (id: number, data: number, elements: UI.ElementSet, tile: any | null, yPos: number) => number;

const NativeAPI = ModAPI.requireGlobal("com.zhekasmirnov.innercore.api.NativeAPI");

class Waila {
    static popupWindow: UI.Window;
    static container = new UI.Container;
    static validNativeUI = false;
    static growthStages: { [key: number]: number } = {};
    static extensions: { [key: number]: T_EXTENSION } = {};
    static globalExtensions: T_EXTENSION[] = [];
    static height = 35;

    static lastHeight: number;
    static lastUiProfile: number;
    static lastTool: number;
    static blockPos: { x: number, y: number, z: number };
    static pointedEntity: number;

    static init() {
        this.setGrowthStages(59, 7);
        this.setGrowthStages(141, 7);
        this.setGrowthStages(142, 7);
        this.setGrowthStages(244, 7);

        const {x, y} = this.getPositionFor(NativeAPI.getUiProfile())
        this.popupWindow = new UI.Window({
            location: {
                x,
                y,
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
                    scale: 5
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
                    font: StyleManager.getTitleFont()
                }
            }
        });

        this.popupWindow.setAsGameOverlay(true);
        this.popupWindow.setTouchable(false);
    }

    private static getPositionFor(profile: number) {
        return profile === 0 ? WailaConfig.position.classic : WailaConfig.position.default;
    }

    static mayPopupShow() {
        return Waila.validNativeUI && OPENED_WINDOWS.length === 0;
    }

    static translate(key, defaultValue) {
        const translated = Translation.translate(key);
        return translated !== key ? translated : defaultValue;
    }

    static buildBlockInfo(id: number, data: number, elements: UI.ElementSet) {
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
    }

    static buildEntityInfo(entity: number, type: number, elements: UI.ElementSet, entityHealth: number) {
        const compoundTag = Entity.getCompoundTag(entity);
        const customName = compoundTag.getString("CustomName");
        const age = compoundTag.getInt("Age");
        const id = compoundTag.getString("identifier");
        let yPos = 160;

        elements["name"].text = customName ? this.translate("waila.entity", "Entity") : customName;
        elements["entityType"] = {
            type: "text",
            text: Waila.translate("waila.entity_type", "Entity Type") + ": " + id,
            x: 200,
            y: 100,
            font: StyleManager.getDefaultFont()
        };

        if (age < 0) {
            elements["age"] = {
                type: "text",
                text: Waila.translate("waila.growth", "Growth") + ": " + Math.floor(Math.abs(age) / 20) + Waila.translate("waila.s", "s"),
                x: 200,
                y: yPos,
                font: StyleManager.getDefaultFont()
            };
            yPos += 60;
        }

        if (type < 64 || type > 103) {
            this.addBar({
                elements: elements,
                progress: entityHealth,
                progressMax: Entity.getMaxHealth(entity),
                prefix: "health",
                yPos: yPos
            });
        }
    }

    static showPopup(block: Tile, entity?: number, type?: number, entityHealth?: number) {
        let elements = this.popupWindow.getContent().elements;

        for (let i in elements) {
            if (i !== "slot" && i !== "name" && i !== "frame") {
                elements[i] = null;
            }
        }

        let slot = this.container.getSlot("slot");
        slot.count = 1;

        if (block) {
            slot.id = block.id;
            slot.data = block.data;

            const name = Item.getName(block.id, block.data).split("\n")[0];
            elements["name"].text = name.length <= 18 ? name : name.substr(0, 18) + "...";

            this.buildBlockInfo(block.id, block.data, elements);
        } else {
            slot.id = 383;
            slot.data = type;

            this.buildEntityInfo(entity, type, elements, entityHealth);
        }

        this.height = Math.max(this.height, MINIMAL_WINDOW_HEIGHT);

        const profile = NativeAPI.getUiProfile();
        if (this.lastHeight !== this.height || this.lastUiProfile !== profile || !this.container.isOpened()) {
            const {x, y} = this.getPositionFor(profile)
            const location = this.popupWindow.getLocation();
            location.set(x, y, 300, this.height);

            this.lastHeight = this.height;
            this.lastUiProfile = profile;
            elements["frame"].height = location.globalToWindow(this.height);

            UI.getContext().runOnUiThread(() => {
                Waila.container.openAs(Waila.popupWindow);
            });
        }

        this.height = 35;
    }

    static addBar(obj: BarDescription) {
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
            font: {color: obj.fontColor || Color.WHITE, size: 40, shadow: 0.5}
        };
    }

    static isValidTool(material: string, blockLevel: number) {
        if (material === "unbreaking") {
            return false;
        }

        if (!blockLevel) {
            return true;
        }

        let toolData = ToolAPI.getToolData(this.lastTool);
        return toolData && toolData.blockMaterials && toolData.blockMaterials[material] && toolData.toolMaterial.level >= blockLevel;
    }

    static getGrowthStages(id) {
        let stages = this.growthStages[id];
        if (stages) {
            return stages;
        }

        // @ts-ignore
        if (CropRegistry.isCrop(id)) {
            return 2;
        }

        return -1;
    }

    static setGrowthStages(blockId: number, stages: number) {
        this.growthStages[blockId] = stages;
    }

    // noinspection JSUnusedGlobalSymbols
    static addExtension(id: number, func: T_EXTENSION) {
        if (!id) {
            Logger.Log("Block id is not correct (Extension Registration)", "ERROR");
            return;
        }

        if (!func) {
            Logger.Log("Function is not correct (Extension Registration)", "ERROR");
            return;
        }

        this.extensions[id] = func;
    }

    static addGlobalExtension(func: T_EXTENSION) {
        if (!func) {
            Logger.Log("Function is not correct (Global Extension Registration)", "ERROR");
            return;
        }

        this.globalExtensions.push(func);
    }

    static requireHeight(value: number) {
        this.height += value;
    }

    static isValidEntity(entity: number, type: number) {
        return entity !== -1 && type !== 71;
    }
}

Waila.init();

Callback.addCallback("LocalTick", () => {
    if (Waila.mayPopupShow()) {
        if (!(World.getThreadTime() % WailaConfig.checkTime)) {
            const pointed = getPointed();
            const pos = pointed.pos;
            const lastPos = Waila.blockPos;

            if (lastPos
                && lastPos.x && lastPos.y && lastPos.z
                && lastPos.x === pos.x && lastPos.y === pos.y && lastPos.z === pos.z) {
                return;
            }

            let entity = Waila.pointedEntity;
            if (entity !== -1 && pointed.entity === entity) {
                return;
            }

            Waila.blockPos = pos;
            entity = Waila.pointedEntity = pointed.entity;

            if (pos.x !== 0 || pos.y !== 0 || pos.z !== 0) {
                const block = World.getBlock(pos.x, pos.y, pos.z);
                if (block.id !== 0) {
                    if (block.id > 255 && block.id < 8196) {
                        block.id = 255 - block.id;
                    }
                    Waila.lastTool = Player.getCarriedItem().id;
                    Waila.showPopup(block);
                }
                return;
            }

            const type = Entity.getType(entity);
            if (Waila.isValidEntity(entity, type)) {
                Waila.showPopup(null, entity, type, Entity.getHealth(entity));
                return;
            }

            Waila.container.close();
        }
    } else if (Waila.container.isOpened()) {
        Waila.container.close();
    }
});

Callback.addCallback("EntityHurt", (attacker, entity, damage) => {
    if (Waila.pointedEntity === entity && Waila.container.isOpened()) {
        const health = Entity.getHealth(entity) - damage;
        if (health <= 0) {
            Waila.container.close();
            return;
        }

        const type = Entity.getType(entity);
        if (Waila.isValidEntity(entity, type)) {
            Waila.showPopup(null, entity, type, health);
        }
    }
});

Callback.addCallback("NativeGuiChanged", screenName => {
    Waila.validNativeUI = screenName === "hud_screen" || screenName === "in_game_play_screen";
});

Callback.addCallback("ContainerOpened", (container, window) => {
    if (!window) {
        return;
    }

    if (!(window as UI.Window).isNotFocusable) { //WindowGroup
        OPENED_WINDOWS.push(window);
        return;
    }

    if (!window.equals(Waila.popupWindow) && !(window as UI.Window).isNotFocusable()) {
        OPENED_WINDOWS.push(window);
    }
});

Callback.addCallback("ContainerClosed", (container, window) => {
    let index = OPENED_WINDOWS.indexOf(window);
    if (index !== -1) {
        OPENED_WINDOWS.splice(index, 1);
    }
});