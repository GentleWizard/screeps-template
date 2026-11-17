export function harvestEnergy(creep: Creep) {
	const source =
		creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) ??
		creep.pos.findClosestByPath(FIND_SOURCES);

	if (!source) return;

	if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
		creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
	}
}

export function setWorkingIfHasEnergy(creep: Creep) {
	const is_working = creep.memory.working;
	if (is_working && creep.store[RESOURCE_ENERGY] === 0) {
		creep.memory.working = false;
	}

	if (!is_working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
		creep.memory.working = true;
	}
}
