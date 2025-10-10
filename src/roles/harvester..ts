export const harvester = {
    run: function (creep: Creep): void {
        if (creep.store.getFreeCapacity() > 0) {
            const sources = creep.room.find(FIND_SOURCES);

            const sourcesByPath = sources
                .map((source) => ({
                    source,
                    path: creep.pos.findPathTo(source),
                }))
                .filter((source) => source.path.length > 0)
                .sort((a, b) => a.path.length - b.path.length);

            if (sourcesByPath.length === 0) {
                console.log(`${creep.name} cannot reach any source.`);
                return;
            }

            const targetSource = sourcesByPath[0].source;
            if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
                const moveResult = creep.moveTo(targetSource, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
                if (moveResult === ERR_NO_PATH) {
                    console.log(`${creep.name} cannot move to source.`);
                }
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
            }
        }
    },
};
