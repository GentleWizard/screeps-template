export function spawnCreep(body: BodyPartConstant[], role: string): void {
    const spawns = Object.values(Game.spawns);
    const cost = body.reduce((sum, part) => sum + BODYPART_COST[part], 0);

    if (spawns[0].store.energy > cost && !spawns[0].spawning) {
        const newName = `${role}-${Game.time}`;
        spawns[0].spawnCreep(body, newName, {
            memory: { role: role },
        });
        console.log(`Spawning new ${role}: ${newName}`);
    } else if (spawns[0].spawning) {
        console.log(`Spawn is already busy.`);
    } else {
        console.log(
            `Not enough energy to spawn ${role}. Required: ${cost}, Available: ${spawns[0].store.energy}`
        );
    }
}
