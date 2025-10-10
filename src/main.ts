import { builder } from "./roles/builder";
import { harvester } from "./roles/harvester.";
import { upgrader } from "./roles/upgrader";

module.exports.loop = function (): void {
    const spawns = Object.values(Game.spawns);

    const harvesters = Object.entries(Game.creeps).filter(
        ([name, creep]) => creep.memory.role === "harvester"
    );
    const upgraders = Object.entries(Game.creeps).filter(
        ([name, creep]) => creep.memory.role === "upgrader"
    );
    const builders = Object.entries(Game.creeps).filter(
        ([name, creep]) => creep.memory.role === "builder"
    );

    if (harvesters.length < 2) {
        const newName = `Harvester-${Game.time}`;
        spawns[0].spawnCreep([WORK, CARRY, MOVE], newName, {
            memory: { role: "harvester" },
        });
        console.log(`Spawning new harvester: ${newName}`);
    }

    if (upgraders.length < 2) {
        const newName = `Upgrader-${Game.time}`;
        spawns[0].spawnCreep([WORK, CARRY, MOVE], newName, {
            memory: { role: "upgrader" },
        });
        console.log(`Spawning new upgrader: ${newName}`);
    }

    if (builders.length < 2) {
        const newName = `Builder-${Game.time}`;
        spawns[0].spawnCreep([WORK, CARRY, MOVE], newName, {
            memory: { role: "builder" },
        });
        console.log(`Spawning new builder: ${newName}`);
    }

    harvesters.map(([name, creep]) => harvester.run(creep));
    upgraders.map(([name, creep]) => upgrader.run(creep));
    builders.map(([name, creep]) => builder.run(creep));
};
