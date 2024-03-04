import { 
    ApplicationCommandDataResolvable, 
    Client, 
    ClientEvents, 
    Collection, 
    GatewayIntentBits } from "discord.js";
import { glob } from "glob";
import { Event } from "./Event";
import { Logger } from "../util/Logger";
import { TimerManager } from "./TimerManager";
import { RetroAchievementsApi } from "../integrations/RA-API";
import { guildId, token } from "../../data/discordSecrets.json";
import type { CommandType } from "../types/CommandTypes";

export class ExtendedClient extends Client {
    public ra: RetroAchievementsApi;
    public timers: TimerManager;
    public commands: Collection<string, CommandType> = new Collection();
    private slashCommands: ApplicationCommandDataResolvable[] = [];
    public shouldRegisterCommands: boolean = false;

    constructor(shouldRegisterCommands: boolean = false) {
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

        this.shouldRegisterCommands = shouldRegisterCommands;
        this.start();
        this.ra = new RetroAchievementsApi();
        this.timers = new TimerManager(this);
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
            console.log(command.defaultMemberPermissions);
            this.commands.set(command.name, command);
            this.slashCommands.push(command);
        };
    }

    async registerCommands(): Promise<void> {
        Logger.log(`Registering ${this.slashCommands.length} slash commands...`, "red");
        await this.guilds.cache.get(guildId)?.commands.set(this.slashCommands);
    }
}