export function findEnergySources(creep: Creep): {
    source: Source;
    path: PathStep[];
}[] {
    const sources = creep.room.find(FIND_SOURCES);

    const sourcesByPath = sources
        .map((source) => ({
            source,
            path: creep.pos.findPathTo(source),
        }))
        .filter((source) => source.path.length > 0)
        .sort((a, b) => a.path.length - b.path.length);

    return sourcesByPath;
}

export function harvestNearestEnergySource(creep: Creep): ScreepsReturnCode {
    const sourcesByPath = findEnergySources(creep);
    if (sourcesByPath.length === 0) {
        console.log(`${creep.name} cannot reach any source.`);
        return ERR_NOT_FOUND;
    }

    const prioritized = [
        ...sourcesByPath.filter((s) => s.source.energy > 0),
        ...sourcesByPath.filter((s) => s.source.energy === 0),
    ];

    for (const { source: targetSource } of prioritized) {
        const harvestResult = creep.harvest(targetSource);

        if (harvestResult === OK) {
            return OK;
        }

        if (harvestResult === ERR_NOT_IN_RANGE) {
            const moveResult = creep.moveTo(targetSource, {
                visualizePathStyle: { stroke: "#ffaa00" },
            });

            if (moveResult === ERR_NO_PATH) {
                // Can't reach this source, try the next one.
                console.log(
                    `${creep.name} cannot move to source ${targetSource.id}, trying next source.`
                );
                continue;
            }

            // If move succeeded or is a transient "tired" state, return it so caller can handle ticks.
            if (moveResult === OK || moveResult === ERR_TIRED) {
                return moveResult;
            }

            // For other move errors, log and try next candidate where sensible.
            console.log(
                `${creep.name} moveTo returned ${moveResult} for source ${targetSource.id}.`
            );
            if (moveResult === ERR_INVALID_TARGET) {
                continue;
            }

            return moveResult;
        }

        if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
            // Source temporarily empty; try the next candidate.
            console.log(
                `${creep.name} attempted to harvest an empty source ${targetSource.id}, trying next source.`
            );
            continue;
        }

        if (harvestResult === ERR_INVALID_TARGET) {
            // Target disappeared or became invalid; try the next one.
            continue;
        }

        // Return any other unexpected result.
        return harvestResult;
    }

    console.log(`${creep.name} could not reach any candidate source.`);
    return ERR_NO_PATH;
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
