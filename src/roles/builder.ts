export const builder = {
    run: function (creep: Creep): void {
        if (
            !creep.memory.building &&
            creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()
        ) {
            creep.memory.building = true;
        }

        if (creep.memory.building) {
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length > 0) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    },
};
