import { 
    ApplicationCommandDataResolvable, 
    Channel, 
    Client, 
    ClientEvents, 
    Collection, 
    GatewayIntentBits, 
    MessageCreateOptions,
    MessagePayload,
    TextChannel} from "discord.js";
import { glob } from "glob";
import { BlueskyApi } from "../integrations/Bluesky-API";
import { Event } from "./Event";
import { GuildSettingsManager } from "./GuildSettingsManager";
import { Logger } from "../util/Logger";
import { MessageHandler } from "./MessageHandler";
import { RetroAchievementsManager } from "../integrations/RetroAchievementsManager";
import { TimerManager } from "./TimerManager";
import { discordAppToken } from "../../data/config.json";
import type { CommandType } from "../types/CommandTypes";


export class ExtendedClient extends Client {
    public bluesky: BlueskyApi;
    public ra: RetroAchievementsManager;
    public timers: TimerManager;
    public messageHandler: MessageHandler;
    public settingsManager: GuildSettingsManager;

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
        this.ra = new RetroAchievementsManager(this);
        this.bluesky = new BlueskyApi();
        this.timers = new TimerManager(this);
        this.messageHandler = new MessageHandler();
        this.settingsManager = new GuildSettingsManager();
    }

    start(): void {
        this.setEvents();
        this.setCommands();
        this.login(discordAppToken);
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
        //Logger.log(`Registering ${this.slashCommands.length} slash commands...`, "red");
        const guildIds: Array<string> = await this.settingsManager.getGuildIds();
        for (const guildId of guildIds) {
            await this.guilds.cache.get(guildId)?.commands.set(this.slashCommands);
        }
    }

    public async send(channelID: string, options: string | MessagePayload | MessageCreateOptions): Promise<void> {
        try {
            const channel: Channel = this.channels.cache.get(channelID) as TextChannel;
            await channel.send(options);
        } catch(err) {
            Logger.log(err as string);
        }
    }
}