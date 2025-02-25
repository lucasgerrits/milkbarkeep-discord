import { ExtendedClient } from "./core/ExtendedClient";

// Remove first two which are 'node' and the file
const args = process.argv.slice(2);
let shouldRegister: boolean = false;
if (args.includes("--register")) {
    shouldRegister = true;
}

export const client = new ExtendedClient(shouldRegister);