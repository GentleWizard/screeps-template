import { CreepRole } from ".";

export class Harvester extends CreepRole {
	run() {
		this.gatherOrWork(() => {
			const target = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter: (structure): structure is StructureSpawn | StructureExtension =>
					(structure.structureType === STRUCTURE_SPAWN ||
						structure.structureType === STRUCTURE_EXTENSION) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
			});

			if (!target) return;

			if (this.creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
			}
		});
	}
}
