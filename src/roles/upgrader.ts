import { harvestNearestEnergySource } from "./utils";

export const upgrader = {
    run: function (creep: Creep) {
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
        }

        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            if (
                creep.room.controller &&
                creep.upgradeController(creep.room.controller) ==
                    ERR_NOT_IN_RANGE
            ) {
                creep.moveTo(creep.room.controller);
            }
        } else {
            harvestNearestEnergySource(creep);
        }
    },
};
