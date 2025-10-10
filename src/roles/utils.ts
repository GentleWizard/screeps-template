/**
 * Find the nearest source that the creep can actually reach (path to an adjacent tile exists).
 * Returns the Source or null if none are reachable.
 */
export function findNearestEnergySource(creep: Creep): Source | null {
    const sources = creep.room.find(FIND_SOURCES);

    const reachable = sources
        .map((source) => ({
            source,
            path: creep.pos.findPathTo(source.pos, {
                range: 1,
                ignoreCreeps: true,
            }),
        }))
        .filter((item) => item.path.length > 0)
        .sort((a, b) => a.path.length - b.path.length);

    return reachable.length > 0 ? reachable[0].source : null;
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

export function moveToIdlePosition(creep: Creep): void {
    const idleFlag = Game.flags["Idle"];
    if (idleFlag) {
        creep.moveTo(idleFlag, { visualizePathStyle: { stroke: "#888888" } });
        return;
    }
    // Otherwise, move to a random open tile nearby
    for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
            if (dx === 0 && dy === 0) continue;
            const pos = new RoomPosition(
                creep.pos.x + dx,
                creep.pos.y + dy,
                creep.pos.roomName
            );
            if (
                creep.room.getTerrain().get(pos.x, pos.y) !==
                    TERRAIN_MASK_WALL &&
                creep.room.lookForAt(LOOK_CREEPS, pos).length === 0 &&
                creep.room.lookForAt(LOOK_STRUCTURES, pos).length === 0
            ) {
                creep.moveTo(pos, {
                    visualizePathStyle: { stroke: "#888888" },
                });
                return;
            }
        }
    }
}
