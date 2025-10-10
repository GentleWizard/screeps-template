export function findNearestEnergySource(creep: Creep): Source | null {
    const sources = creep.room.find(FIND_SOURCES);

    const sourcesByPath = sources
        .map((source) => ({
            source,
            path: creep.pos.findPathTo(source),
        }))
        .filter((source) => source.path.length > 0)
        .sort((a, b) => a.path.length - b.path.length);

    return sourcesByPath.length > 0 ? sourcesByPath[0].source : null;
}

export function harvestNearestEnergySource(creep: Creep): ScreepsReturnCode {
    const targetSource = findNearestEnergySource(creep);

    if (!targetSource) {
        console.log(`${creep.name} cannot reach any source.`);
        return ERR_NOT_FOUND;
    }

    if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
        const moveResult = creep.moveTo(targetSource, {
            visualizePathStyle: { stroke: "#ffaa00" },
        });
        if (moveResult === ERR_NO_PATH) {
            console.log(`${creep.name} cannot move to source.`);
            return ERR_NO_PATH;
        }
    }
    return OK;
}
