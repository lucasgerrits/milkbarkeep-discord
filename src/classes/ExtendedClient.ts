import { 
    ApplicationCommandDataResolvable, 
    Client, 
    ClientEvents, 
    Collection, 
    GatewayIntentBits } from "discord.js";
import { glob } from "glob";
import { Event } from "./Event";
import { guildId, token } from "../../data/discordSecrets.json";
import type { CommandType } from "../types/CommandTypes";

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.MessageContent,
            ],
            allowedMentions: {
                parse: [],
                repliedUser: false,
            },
        })
    }

    start(): void {
        this.registerCommands();
        this.registerEvents();
        this.login(token);
    }

    async importFile(filePath: string): Promise<any> {
        return (await import(filePath))?.default;
    }

    async registerCommands() {
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await glob(`${__dirname}/../commands/*/*{.ts,.js}`);
        commandFiles.forEach(async (filePath) => {
            const command: CommandType = await this.importFile(`${__dirname}/../${filePath}`);
            console.log("Hi " + command);
            if (!command.name) { return; }
            this.commands.set(command.name, command);
            slashCommands.push(command);
            // Register to Discord
            this.guilds.cache.get(guildId)?.commands.set(slashCommands);
        });
    }

    async registerEvents() {
        const eventFiles = await glob(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await this.importFile(`${__dirname}/../${filePath}`);
            this.on(event.event, event.run);
        })
    }
}