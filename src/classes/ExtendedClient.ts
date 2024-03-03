import { 
    ApplicationCommandDataResolvable, 
    Client, 
    ClientEvents, 
    Collection, 
    GatewayIntentBits } from "discord.js";
import { glob } from "glob";
import { Event } from "./Event";
import { Logger } from "../util/Logger";
import { guildId, token } from "../../data/discordSecrets.json";
import type { CommandType } from "../types/CommandTypes";

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandType> = new Collection();
    private slashCommands: ApplicationCommandDataResolvable[] = [];

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
        this.setEvents();
        this.setCommands();
        this.login(token);
    }

    async importFile(filePath: string): Promise<any> {
        return (await import(filePath))?.default;
    }

    private async setEvents(): Promise<void> {
        const eventFiles = await glob(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await this.importFile(`${__dirname}/../${filePath}`);
            this.on(event.event, event.run);
        })
    }

    private async setCommands(): Promise<void> {
        const commandFiles = await glob(`${__dirname}/../commands/*/*{.ts,.js}`);
        for (const file of commandFiles) {
            const command: CommandType = await this.importFile(`${__dirname}/../${file}`);
            if (!command.name) { return; }
            this.commands.set(command.name, command);
            this.slashCommands.push(command);
        };
    }

    async registerCommands(): Promise<void> {
        // Register to Discord
        Logger.log(`Registering ${this.slashCommands.length} slash commands...`, "red");
        await this.guilds.cache.get(guildId)?.commands.set([]);
        await this.guilds.cache.get(guildId)?.commands.set(this.slashCommands);

        await this.application?.commands.set([]);
        await this.application?.commands.set(this.slashCommands);
    }
}