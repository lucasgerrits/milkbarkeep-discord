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
import { Event } from "./Event";
import { GuildConfigManager } from "./GuildConfigManager";
import { Logger } from "../util/Logger";
import { MessageHandler } from "./MessageHandler";
import { TimerManagerV2 } from "./TimerManagerV2";
import { RetroAchievementsApi } from "../integrations/RA-API";
import { token } from "../../data/discordSecrets.json";
import type { CommandType } from "../types/CommandTypes";
import { BlueskyApi } from "../integrations/Bluesky-API";

export class ExtendedClient extends Client {
    public bluesky: BlueskyApi;
    public ra: RetroAchievementsApi;
    public timers: TimerManagerV2;
    public messageHandler: MessageHandler;
    public configManager: GuildConfigManager;

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
        this.bluesky = new BlueskyApi();
        this.timers = new TimerManagerV2(this);
        this.messageHandler = new MessageHandler();
        this.configManager = new GuildConfigManager();
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
        //Logger.log(`Registering ${this.slashCommands.length} slash commands...`, "red");
        const configs = await this.configManager.getConfigArray();
        for (const config of configs) {
            await this.guilds.cache.get(config.id)?.commands.set(this.slashCommands);
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