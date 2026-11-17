export type Role = "harvester" | "upgrader" | "builder";

declare global {
	interface CreepMemory {
		role?: Role;
		working?: boolean;
	}

	interface FlagMemory {}

	interface PowerCreepMemory {}

	interface RoomMemory {}

	interface SpawnMemory {}
}
