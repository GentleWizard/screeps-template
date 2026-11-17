import { CreepRole } from ".";

export class Builder extends CreepRole {
	run() {
		this.gatherOrWork(() => {
			const site = this.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

			if (!site) return;

			if (this.creep.build(site) === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
			}
		});
	}
}
