import { builder } from "./roles/builder";
import { harvester } from "./roles/harvester.";
import { upgrader } from "./roles/upgrader";
import { spawnCreep } from "./utils";
const minimumHarvesters = 2;
const minimumUpgraders = 2;
const minimumBuilders = 2;

const harvestBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
const upgradeBody: BodyPartConstant[] = [WORK, CARRY, MOVE];
const buildBody: BodyPartConstant[] = [WORK, CARRY, MOVE];

module.exports.loop = function (): void {
    const harvesters = Object.entries(Game.creeps).filter(
        ([name, creep]) => creep.memory.role === "harvester"
    );
    const upgraders = Object.entries(Game.creeps).filter(
        ([name, creep]) => creep.memory.role === "upgrader"
    );
    const builders = Object.entries(Game.creeps).filter(
        ([name, creep]) => creep.memory.role === "builder"
    );

    if (harvesters.length < minimumHarvesters) {
        spawnCreep(harvestBody, "harvester");
    }
    if (
        upgraders.length < minimumUpgraders &&
        harvesters.length === minimumHarvesters
    ) {
        spawnCreep(upgradeBody, "upgrader");
    }
    if (
        builders.length < minimumBuilders &&
        harvesters.length === minimumHarvesters
    ) {
        spawnCreep(buildBody, "builder");
    }

    harvesters.map(([name, creep]) => harvester.run(creep));
    upgraders.map(([name, creep]) => upgrader.run(creep));
    builders.map(([name, creep]) => builder.run(creep));
};
