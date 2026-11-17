import type { CreepRole } from "./creeps";
import { Builder } from "./creeps/builder";
import { Harvester } from "./creeps/harvester";
import { Upgrader } from "./creeps/upgrader";
import type { Role } from "./types";

const MINIMUM_PER_ROLE = 2;

const WORKER_BODY: BodyPartConstant[] = [WORK, CARRY, MOVE];

const ROLES: Record<Role, new (creep: Creep) => CreepRole> = {
	harvester: Harvester,
	upgrader: Upgrader,
	builder: Builder,
};

function ensureCreeps(role: Role, allowSpawn: boolean): Creep[] {
	const creeps: Creep[] = [];

	for (let index = 0; index < MINIMUM_PER_ROLE; index++) {
		const name = `${role}-${index}`;
		const existing = Game.creeps[name];
		if (existing) {
			creeps.push(existing);
			continue;
		}
		if (allowSpawn) spawnCreep(name, role);
	}

	return creeps;
}

function spawnCreep(name: string, role: Role) {
	const spawn = findSpawn();

	if (!spawn || spawn.spawning) return;

	if (spawn.spawnCreep(WORKER_BODY, name, { memory: { role } }) === OK) {
		console.log(`Spawning new ${role}: ${name}`);
	}
}

function findSpawn(): StructureSpawn | undefined {
	for (const name in Game.spawns) return Game.spawns[name];

	return undefined;
}

function clearDeadCreepMemory() {
	for (const name in Memory.creeps) {
		if (!Game.creeps[name]) delete Memory.creeps[name];
	}
}

export function loop() {
	clearDeadCreepMemory();

	const harvesters = ensureCreeps("harvester", true);
	const canExpand = harvesters.length === MINIMUM_PER_ROLE;
	ensureCreeps("upgrader", canExpand);
	ensureCreeps("builder", canExpand);

	for (const name in Game.creeps) {
		const creep = Game.creeps[name];
		const role = creep.memory.role;
		if (role) new ROLES[role](creep).run();
	}
}
