import { CreepRole } from ".";

export class Upgrader extends CreepRole {
	run() {
		this.gatherOrWork(() => {
			const controller = this.creep.room.controller;

			if (controller && this.creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
				this.creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
			}
		});
	}
}
