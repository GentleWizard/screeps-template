import * as test from "./test";
declare var module: any;

function loop(): void {
    console.log(`Current game tick is ${Game.time}`);
    test.test();
}

module.exports.loop = loop;
