import { harvestEnergy, setWorkingIfHasEnergy } from "../utils";

export abstract class CreepRole {
	constructor(protected readonly creep: Creep) {}

	abstract run(): void;

	protected gatherOrWork(work: () => void): void {
		setWorkingIfHasEnergy(this.creep);
		if (!this.creep.memory.working) return harvestEnergy(this.creep);
		work();
	}
}
