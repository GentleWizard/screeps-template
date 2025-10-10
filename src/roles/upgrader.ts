import { harvestNearestEnergySource } from "./utils";

export const upgrader = {
    run: function (creep: Creep) {
        if (creep.store[RESOURCE_ENERGY] == 0) {
            harvestNearestEnergySource(creep);
        } else {
            if (
                creep.room.controller &&
                creep.upgradeController(creep.room.controller) ==
                    ERR_NOT_IN_RANGE
            ) {
                creep.moveTo(creep.room.controller);
            }
        }
    },
};
