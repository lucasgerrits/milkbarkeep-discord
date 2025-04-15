import { Message } from "discord.js";
import { ExtendedClient } from "./ExtendedClient";

export class TriggerMap {
    private clientRef: ExtendedClient;
    private map: Map<string, () => string>

    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
        this.map = new Map<string, () => string>();
    }

    public check(message: Message): void {
        const content: string = message.content;
        if (this.hasCommand(content)) {
            this.runCommand(message);
        }
    }

    private hasCommand(content: string): boolean {
        const [command, ...args]: string[] = content.trim().split(/\s+/);
        return this.map.has(command);
    }

    private runCommand(message: Message): void {

    }

    private hasTriggers(content: string) {
        
    }
}