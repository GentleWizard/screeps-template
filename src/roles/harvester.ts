import { harvestNearestEnergySource, moveToIdlePosition } from "./utils";

export const harvester = {
    run: function (creep: Creep): void {
        if (creep.store.getFreeCapacity() > 0) {
            const targetSource = harvestNearestEnergySource(creep);
            if (targetSource === ERR_NOT_FOUND) {
                console.log(`${creep.name} cannot reach any source.`);
            } else if (targetSource === ERR_NO_PATH) {
                console.log(`${creep.name} cannot move to source.`);
            }
        } else {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    );
                },
            });
            if (targets.length > 0) {
                if (
                    creep.transfer(targets[0], RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(targets[0], {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                moveToIdlePosition(creep);
            }
        }
    },
};
