import { builder } from "./roles/builder";
import { harvester } from "./roles/harvester.";
import { upgrader } from "./roles/upgrader";
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

function spawnCreep(body: BodyPartConstant[], role: string): void {
    const spawns = Object.values(Game.spawns);
    const cost = body.reduce((sum, part) => sum + BODYPART_COST[part], 0);

    if (spawns[0].store.energy > cost && !spawns[0].spawning) {
        const newName = `${role}-${Game.time}`;
        spawns[0].spawnCreep(body, newName, {
            memory: { role: role },
        });
        console.log(`Spawning new ${role}: ${newName}`);
    } else if (spawns[0].spawning) {
        console.log(`Spawn is already busy.`);
    } else {
        console.log(
            `Not enough energy to spawn ${role}. Required: ${cost}, Available: ${spawns[0].store.energy}`
        );
    }
}
