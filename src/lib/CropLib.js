//CropLib by Nikolay Savenko
//TODO: intergate JSDoc
//API level: 3.0
LIBRARY({
    name: "CropLib",
    version: 5,
    shared: true,
    api: "CoreEngine"
});

IMPORT("framework");

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var RENDER_TYPE_SQUARE = 6;
var RENDER_TYPE_CROSS = 1;

var CommonCrop = Block.createSpecialType({
    base: 59,
    opaque: false,
    rendertype: RENDER_TYPE_SQUARE,
    lightopacity: 0,
    destroytime: 0,
    sound: "grass"
});

var CommonSapling = Block.createSpecialType({
    base: 59,
    opaque: false,
    rendertype: RENDER_TYPE_CROSS,
    lightopacity: 0,
    destroytime: 0,
    sound: "grass"
});

//Please read docs before use
//But this lib have no docs...

var CropRegistry = {

    invertedSide: {
        0: 1,
        1: 0,
        2: 3,
        3: 2,
        4: 5,
        5: 4
    },

    crops: {},

    create: function (cls, params) {
        let crop = new cls(params);
        if (crop.blockID) this.crops[crop.blockID] = crop;
    },

    isCrop: function (crop) {//you can insert id or tileEntity
        if (typeof (crop) == "number") {
            return this.crops[crop]
        } else if (typeof (crop) == "object") {
            return crop.isCrop;
        }
    },

    getCropClass: function (blockID) {
        return this.crops[blockID] || null;
    },

    debugObject: function (object) {
        Debug.m(Object.keys(object));
        alert(Object.keys(object));
    }
};

let CropInterface = {
    standart: {
        grow: function () {
            alert("grow Standart");
            return false
        },
        harvest: function () {
            alert("harvest Standart");
            return null
        },
        canGrow: function () {
            alert("canGrow Standart");
            return false
        },
        canBeHarvested: function () {
            alert("canBeHarvested Standart");
            return false
        }
    },

    inworld: {},//micro optimization

    getStringCoordsKey: function (coords) {
        return coords.x + ':' + coords.y + ':' + coords.z;
    },

    hasInterface: function (coords) {
        let key = this.getStringCoordsKey(coords);
        return this.inworld[key];
    },

    getCropInterface: function (coords) {
        let key = this.getStringCoordsKey(coords);
        let id = World.getBlockID(coords.x, coords.y, coords.z);
        if (!this.hasInterface(coords) && CropRegistry.isCrop(id)) {
            this.inworld[key] = this.createCropInterface(coords);
        }
        return this.inworld[key];
    },

    createCropInterface: function (coords) {
        let id = World.getBlockID(coords.x, coords.y, coords.z);
        let cls = CropRegistry.getCropClass(id);
        let interface = {};

        if (cls) {
            let methods = this.getMethodsFromCropClass(cls);

            for (let name in methods) {
                let args = [coords.x, coords.y, coords.z]
                interface[name] = this.createInterfaceFuncByName(args, cls, methods, name);
            }

        } else if (TileEntity.isTileEntityBlock(id)) {
            let prototype = TileEntity.getPrototype(id);
            let tileEntity = World.getTileEntity(coords.x, coords.y, coords.z);

            let methods = this.getMethodsFromTileEntity(prototype);
            for (let name in this.standart) {
                interface[name] = this.createInterfaceFuncByName([], tileEntity, methods, name);
            }
        }

        if (Object.keys(interface).length != 0) return interface;
        return null;
    },

    createInterfaceFuncByName: function (args, victim, obj, name) {
        return function () {
            args.push(arguments[0]);
            return obj[name].apply(victim, args);
        };
    },

    getMethodsFromCropClass: function (cls) {
        let methodList = cls.interface;
        if (!(methodList && methodList.length)) return null;

        let methods = {};
        for (let i in methodList) {
            let methodName = methodList[i];
            let method = cls[methodName] || CropInterface.standart[methodName];
            methods[methodName] = method;
        }
        return methods;
    },

    getMethodsFromTileEntity: function (prototype) {
        let methods = {};
        for (let name in this.standart) {
            methods[name] = prototype[name] || this.standart[name];
        }
        return methods;
    }
};

Callback.addCallback("PostLoaded", function () {
    //CropRegistry.debugObject(CropRegistry.crops);
});

Callback.addCallback("DestroyBlock", function (coords, block, player) {
    if (CropInterface.hasInterface(coords)) {
        alert("delete");
        CropInterface.inworld[CropInterface.getStringCoordsKey(coords)] = null;
    }
});


let AbstractCrop = $("AbstractCrop", {
    maxSize: 0,
    getMaxSize: function () {
        return this.maxSize
    },
    __init__: function (params) {
        this.params = params;
    }
});

let CollisionShapeCrop = $("CollisionShapeCrop", {
    shape: [7 / 8, 7 / 8, 7 / 8, 1 / 8, 1 / 8, 1 / 8],
    setShape: function (id, datas) {
        for (var m = 0; m < datas; m++) {
            var shape = new ICRender.CollisionShape();
            shape.addEntry().addBox(7 / 8, 7 / 8, 7 / 8, 1 / 8, 1 / 8, 1 / 8);
            BlockRenderer.setCustomCollisionShape(id, m, shape);
        }
    }
});

let AbstractBlockCrop = $("AbstractBlockCrop", {
    extends: AbstractCrop,
    includes: [CollisionShapeCrop],

    blocktype: undefined,

    blockMaterial: "plant",

    __load__: function () {
        let params = this.params;
        params.texture = params.texture || params.id;

        if (!params.variations) {
            params.variations = [];
            let count = this.getMaxSize() + 1;
            for (let i = 0; i < count; i++) {
                params.variations.push({
                    name: params.id + i.toString(),
                    texture: [[params.texture, i]],
                    inCreative: params.creative
                });
            }
        }

        IDRegistry.genBlockID(params.id);
        Block.createBlock(params.id, params.variations, this.blockType);
        this.blockID = BlockID[params.id];

        this.setShape(this.blockID, this.getMaxSize() + 1);

        if (this.blockMaterial) {
            ToolAPI.registerBlockMaterial(this.blockID, this.blockMaterial);
        }
    }
});

let FarmlandCrop = $("FarmlandCrop", {
    farmlands: [{id: 60, data: -1}],
    getFarmlands: function () {
        return this.farmlands
    },

    isFarmland: function (block) {
        let farmlands = this.getFarmlands();
        if (!farmlands.length) return true;
        for (let i in farmlands) {
            let farm = farmlands[i];
            if (block.id == farm.id && (farm.data == -1 || block.data == farm.data)) return true;
        }
        return false;
    },

    checkFarmland: function (x, y, z, side) {
        let relCoords = World.getRelativeCoords(x, y, z, CropRegistry.invertedSide[side]);
        let block = World.getBlock(relCoords.x, relCoords.y, relCoords.z);
        if (!this.isFarmland(block)) World.destroyBlock(x, y, z);
    }
});

let PuttableCrop = $("PuttableCrop", {
    extends: AbstractBlockCrop,
    includes: [FarmlandCrop],

    side: 1,
    getSide: function () {
        return this.side
    },

    isCorrectSide: function (side) {
        return this.side == side
    },

    __load__: function () {
        this.super.__load__();
        let self = this;
        if (!self.params.seed) return;
        Item.registerUseFunctionForID(self.params.seed.id, function (coords, item, block) {
            if (!(self.isCorrectSide(coords.side) && self.isFarmland(block))) return;
            World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, parseInt(self.blockID), 0);
            if (self.params.seed.decrease) Player.decreaseCarriedItem(1);
        });
    }
});

let HarvestableCrop = $("HarvestableCrop", {
    extends: PuttableCrop,

    sizeAfrterHarvest: 0,
    getSizeAfterHarvest: function () {
        return this.sizeAfrterHarvest
    },

    __load__: function () {
        this.super.__load__();
    },

    getProducts: function () {
        let products = [];
        for (let i in this.params.products) {
            let product = this.params.products[i];
            let count = product.count;
            if (typeof (count) != "number") {
                count = random(count.min, count.max);
            }
            products.push({id: product.id, data: product.data, count: count});
        }
        return products;
    },

    canBeHarvested: function (x, y, z, blockData) {
        if (!blockData) blockData = World.getBlockData(x, y, z);
        return blockData >= this.getMaxSize();
    },

    harvest: function (x, y, z, manual, blockData) {
        let block = World.getBlock(x, y, z);
        if (this.canBeHarvested(x, y, z, blockData)) {
            World.setBlock(x, y, z, block.id, this.getSizeAfterHarvest());
            let products = this.getProducts();
            if (manual) this.drop(x, y, z, products);
            return products;
        }
        return null;
    },

    drop: function (x, y, z, products) {
        for (let i in products) {
            let product = products[i];
            World.drop(x, y, z, product.id, product.count, product.data);
        }
    }
});


let InterfaceCrop = $("InterfaceCrop", {
    interface: ["grow", "harvest", "canGrow", "canBeHarvested"]
});

let CropFertilizer = $("CropFertilizer", {
    fertilizers: [{id: 351, data: 15}],
    growChanceViaFertilizer: 1,

    getFertilizers: function () {
        return this.fertilizers
    },

    isFertilizer: function (item) {
        let fertilizers = this.getFertilizers();
        if (!fertilizers.length) return false;
        for (let i in fertilizers) {
            let fertilizer = fertilizers[i];
            if (fertilizer.id == item.id && (fertilizer.data == -1 || fertilizer.data == item.data)) return true;
        }
        return false;
    },

    getGrowChanceViaFertilizer: function () {
        return this.growChanceViaFertilizer
    }
});

let CropParticles = $("CropParticles", {

    particles: {
        count: 10,
        type: Native.ParticleType.happyVillager
    },

    getParticles: function () {
        return this.particles
    },

    emitParticles: function (x, y, z) {
        let particles = this.getParticles();
        if (!particles) return;
        for (let i = 0; i < particles.count; i++) {
            this.emit(x, y, z, particles.type);
        }
    },

    emit: function (x, y, z, type) {
        Particles.addParticle(type, x + Math.random(), y + Math.random() * .5, z + Math.random(), 0, 0, 0, 0);
    }
});

let GrasslikeCrop = $("GrasslikeCrop", {
    extends: HarvestableCrop,
    includes: [InterfaceCrop],


    destroyBlock: function (coords, block, player) {
        this.checkFarmlandDestroy(coords, block);
    },

    checkFarmlandDestroy: function (coords, block) {
        let side = this.getSide();
        if (!(this.isFarmland(block) && side)) return;

        let relCoords = World.getRelativeCoords(coords.x, coords.y, coords.z, side);
        let relBlock = World.getBlock(relCoords.x, relCoords.y, relCoords.z);
        if (relBlock.id == parseInt(this.blockID)) {
            World.destroyBlock(relCoords.x, relCoords.y, relCoords.z);
            this.destroyBlock(relCoords, relBlock, null);
        }
    },

    __load__: function () {
        this.super.__load__();
        Block.registerDropFunctionForID(parseInt(this.blockID), function () {
            return [];
        });

        let self = this;

        Callback.addCallback("DestroyBlock", function (coords, block, player) {
            self.destroyBlock(coords, block, player);
        });
    }
});

let NormalBush = $("NormalBush", {
    extends: GrasslikeCrop,
    includes: [InterfaceCrop],

    collect: function (x, y, z) {
        let seed = this.params.seed;
        World.drop(x, y, z, seed.id, 1, 0);
        World.destroyBlock(x, y, z);
    },

    harvest: function (x, y, z, manual) {
        ;
        let products = this.getProducts();
        let prod2drop = [];
        let count = random(2, 5);
        for (let i = 0; i < count; i++) {
            let prod = products[random(0, products.length - 1)];
            prod2drop.push(prod);
        }
        if (manual) this.drop(x, y, z, prod2drop);
        return prod2drop;
    },

    __load__: function () {
        this.super.__load__();

        let self = this;

        Callback.addCallback("ItemUse", function (coords, item, block) {
            if (block.id != parseInt(self.blockID)) return;
            self.collect(coords.x, coords.y, coords.z, true);
        });

        Callback.addCallback("DestroyBlock", function (coords, block, player) {
            if (block.id != parseInt(self.blockID)) return;
            self.harvest(coords.x, coords.y, coords.z, true);
        });
    }
});

let NormalSapling = $("NormalSapling", {
    extends: PuttableCrop,
    includes: [CropFertilizer, InterfaceCrop, CropParticles],

    maxSize: 1,

    click: function (coords, item, block) {
        if (this.isFertilizer(item)) {
            Player.decreaseCarriedItem(1);
            this.emitParticles(coords.x, coords.y, coords.z);
            if (this.isReadyForFertilize(block)) {
                this.grow(coords.x, coords.y, coords.z);
            }
        } else {
            this.harvest(coords.x, coords.y, coords.z, true);
        }
    },

    isReadyForFertilize: function (block) {
        if (Math.random() < this.getGrowChanceViaFertilizer()) return true;
        return false;
    },

    randomTick: function (x, y, z) {
        this.checkFarmland(x, y, z);
        if (Math.random() < this.getGrowChance()) this.grow(x, y, z);
    },

    canGrow: function (x, y, z) {
        return true
    },

    grow: function (x, y, z) {
        return true
    },

    __load__: function () {
        this.super.__load__();

        let self = this;

        Callback.addCallback("ItemUse", function (coords, item, block) {
            if (block.id != parseInt(self.blockID)) return;
            self.click(coords, item, block);
        });

        Block.setRandomTickCallback(parseInt(self.blockID), function (x, y, z) {
            self.randomTick(x, y, z, self.getSide());
        });
    }
});


let NormalCrop = $("NormalCrop", {
    extends: HarvestableCrop,
    includes: [CropFertilizer, InterfaceCrop, CropParticles],

    growChance: 1,
    getGrowChance: function () {
        return this.growChance
    },

    click: function (coords, item, block) {
        if (this.isFertilizer(item) && !this.canBeHarvested(coords.x, coords.y, coords.z)) {
            //Debug.m(Player.getCarriedItem());
            // Player.decreaseCarriedItem();
            Player.setCarriedItem(item.id, item.count - 1, item.data);
            //Debug.m(Player.getCarriedItem());
            //TODO FIX item decrease
            //alert("sda");
            this.emitParticles(coords.x, coords.y, coords.z);
            if (this.isReadyForFertilize(block)) {
                this.grow(coords.x, coords.y, coords.z);
            }
        } else {
            this.harvest(coords.x, coords.y, coords.z, true);
        }
    },

    isReadyForFertilize: function (block) {
        if (Math.random() < this.getGrowChanceViaFertilizer()) return true;
        return false;
    },

    destroyBlock: function (coords, block, player) {
        //this.checkFarmlandDestroy(coords, block);
        if (block.id == parseInt(this.blockID)) {
            if (this.canBeHarvested(coords.x, coords.y, coords.z, block.data)) {
                this.harvest(coords.x, coords.y, coords.z, true, block.data);
            } else if (this.params.seed) {
                let seed = this.params.seed;
                World.drop(coords.x, coords.y, coords.z, seed.id, 1, 0);
            }
        }
    },

    checkFarmlandDestroy: function (coords, block) {
        let side = this.getSide();
        if (!(this.isFarmland(block) && side)) return;

        let relCoords = World.getRelativeCoords(coords.x, coords.y, coords.z, side);
        let relBlock = World.getBlock(relCoords.x, relCoords.y, relCoords.z);
        if (relBlock.id == parseInt(this.blockID)) {
            World.destroyBlock(relCoords.x, relCoords.y, relCoords.z);
            this.destroyBlock(relCoords, relBlock, null);
        }
    },

    randomTick: function (x, y, z) {
        this.checkFarmland(x, y, z);
        if (Math.random() < this.getGrowChance()) this.grow(x, y, z);
    },

    canGrow: function (x, y, z) {
        let block = World.getBlock(x, y, z);
        return block.data < this.getMaxSize();
    },

    grow: function (x, y, z) {
        let block = World.getBlock(x, y, z);
        if (this.canGrow(x, y, z)) {
            World.setBlock(x, y, z, block.id, block.data + 1);
            return true;
        }
        return false;
    },

    __load__: function () {
        this.super.__load__();
        Block.registerDropFunctionForID(parseInt(this.blockID), function () {
            return [];
        });

        let self = this;

        Callback.addCallback("ItemUse", function (coords, item, block) {
            if (block.id != parseInt(self.blockID)) return;
            self.click(coords, item, block);
        });

        Callback.addCallback("DestroyBlock", function (coords, block, player) {
            self.destroyBlock(coords, block, player);
        });

        Block.setRandomTickCallback(parseInt(self.blockID), function (x, y, z) {
            self.randomTick(x, y, z);
        });
    }
});


//! emergency crutch. sorry...
World.registerBlockChangeCallback([18], function (coords, oldBlock, newBlock, int1, int2) {
    if (newBlock.id != 18) {
        let relCoords = World.getRelativeCoords(coords.x, coords.y, coords.z, 0);
        let relBlock = World.getBlock(relCoords.x, relCoords.y, relCoords.z);
        if (CropRegistry.isCrop(relBlock.id)) {
            World.destroyBlock(relCoords.x, relCoords.y, relCoords.z);
            Callback.invokeCallback("DestroyBlock", relCoords, relBlock, null);
        }
    }
});

//! emergency crutch. sorry...
World.registerBlockChangeCallback([60], function (coords, oldBlock, newBlock, int1, int2) {
    if (newBlock.id != 60) {
        let relCoords = World.getRelativeCoords(coords.x, coords.y, coords.z, 1);
        let relBlock = World.getBlock(relCoords.x, relCoords.y, relCoords.z);
        if (CropRegistry.isCrop(relBlock.id)) {
            World.destroyBlock(relCoords.x, relCoords.y, relCoords.z);
            Callback.invokeCallback("DestroyBlock", relCoords, relBlock, null);
        }
    }
});


EXPORT("CropRegistry", CropRegistry);
EXPORT("CropInterface", CropInterface);

//renderTypes
EXPORT("RENDER_TYPE_SQUARE", RENDER_TYPE_SQUARE);

//BlockTypes
EXPORT("CommonCrop", CommonCrop);
EXPORT("CommonSapling", CommonSapling);

//classes
EXPORT("AbstractCrop", AbstractCrop);
EXPORT("AbstractBlockCrop", AbstractBlockCrop);
EXPORT("FarmlandCrop", FarmlandCrop);
EXPORT("PuttableCrop", PuttableCrop);
EXPORT("InterfaceCrop", InterfaceCrop);
EXPORT("HarvestableCrop", HarvestableCrop);
EXPORT("CropParticles", CropParticles);
EXPORT("CropFertilizer", CropFertilizer);
EXPORT("NormalCrop", NormalCrop);
EXPORT("GrasslikeCrop", GrasslikeCrop);
EXPORT("NormalSapling", NormalSapling);
EXPORT("NormalBush", NormalBush);