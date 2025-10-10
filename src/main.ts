import { builder } from "./roles/builder";
import { harvester } from "./roles/harvester.";
import { upgrader } from "./roles/upgrader";

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

    const body = [WORK, CARRY, MOVE];

    if (harvesters.length < 2) {
        spawnCreep(body, "harvester");
    }
    if (upgraders.length < 2 && harvesters.length === 2) {
        spawnCreep(body, "upgrader");
    }
    if (builders.length < 2 && harvesters.length === 2) {
        spawnCreep(body, "builder");
    }

    harvesters.map(([name, creep]) => harvester.run(creep));
    upgraders.map(([name, creep]) => upgrader.run(creep));
    builders.map(([name, creep]) => builder.run(creep));
};

function spawnCreep(body: BodyPartConstant[], role: string): void {
    const spawns = Object.values(Game.spawns);
    const cost = body.reduce((sum, part) => sum + BODYPART_COST[part], 0);

    if (spawns[0].store.energy > cost) {
        const newName = `${role}-${Game.time}`;
        spawns[0].spawnCreep(body, newName, {
            memory: { role: role },
        });
        console.log(`Spawning new ${role}: ${newName}`);
    } else {
        console.log(
            `Not enough energy to spawn ${role}. Required: ${cost}, Available: ${spawns[0].store.energy}`
        );
    }
}
