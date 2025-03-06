import { Channel, Collection, Guild, Message, MessageResolvable, TextChannel, User } from "discord.js";
import { EmbedFixManager } from "./EmbedFixManager";
import { GoogleGeminiApi } from "../integrations/GoogleGemini-API";
import { Logger } from "../util/Logger";
import { Util } from "../util/Util";
import { client } from "..";

export class MessageHandler{
    constructor() {}

    public async checkMessage(message: Message): Promise<void> {
        // REACT CHECKS
        this.milkCheck(message);

        // COMMAND CHECKS
        // Convert this to some kind of colllection for non-slash macro commands
        this.tipCheck(message);

        // MISC CHECKS
        EmbedFixManager.check(message);
        this.getAIResponse(message);
    }

    public isPossibleMessageId(possibleId: string): boolean {
        const snowflakeRegex: RegExp = /^\d{17,20}$/;
        possibleId = possibleId.replace(/\+/g, ""); // strip space
        return snowflakeRegex.test(possibleId);
    }

    public async getMessage(guildId: string, possibleMessageId: string, startingChannelId?: string): Promise<Message | undefined> {
        const guild: Guild = client.guilds.cache.get(guildId) as Guild;
        // If initial channel provided
        if (startingChannelId) {
            try {
                const channel: Channel = client.channels.cache.get(startingChannelId) as TextChannel;
                const message: Message = await channel?.messages.fetch(possibleMessageId) as Message;
                return message;
            } catch (error: any) { }
        }
        // Else try the rest belonging to this guild
        const textChannels: Collection<string, TextChannel> = guild.channels.cache.filter(channel => channel.isTextBased()) as Collection<string, TextChannel>;
        for (const channel of textChannels.values()) {
            try {
                const message: Message = await channel.messages.fetch(possibleMessageId);
                return message;
            } catch(error: any) { continue; }
        }
        Logger.log(`Failed to locate message in guild ${guild.name} (${guildId}) with id: ${possibleMessageId}`);
        return undefined;
    }

    private async getAIResponse(message: Message): Promise<void> {
        // Check if bot user has been tagged
        if (message.mentions.has(client.user as User)) {

            // If replying to an existing bot message, check for special exit char
            if (message.reference !== null) {
                const referencedMessage: Message = await message.channel.messages.fetch(message.reference.messageId as MessageResolvable);
                // If braille pattern blank detected, ignore reply (for embed fixes, welcome msg, etc)
                if (Util.hasBrailleBlank(referencedMessage.content)) {
                    return;
                }
            }

            // Otherwise, newly tagged or repliable bot message, so generate AI response
            try {
                const gemini = new GoogleGeminiApi();
                const response = await gemini.chat(message);
                await message.reply(response);
            } catch(error) {
                Logger.log(error as string);
            }
        }
    }

    /*
    private async chiliDogCheck(message: Message): Promise<void> {
        if (message.channel.id !== channelIDs.bombsquad.channels.chiliDog) return;
        // const regex = new RegExp("^(<:cfbOrb:950146443170164767>){1}$");
        const regex: RegExp = new RegExp("^(suckin on a chili dog){1}$");
        if (regex.test(message.content) === false) {
            message.delete();
        }
    }
    */

    private async milkCheck(message: Message): Promise<void> {
        const melkEmote: string = "melk:616025879830855681";
        const milkStrings: string[] = ["milk", "melk", "malk", "mork", "milch"];
        const milkRegex: RegExp = new RegExp(milkStrings.join("|"), "i");

        if (milkRegex.test(message.content)) {
            message.react(melkEmote);
        }
    }

    /* Convert this to some kind of chat command or macro manager */
    private async tipCheck(message: Message): Promise<void> {
        const regex: RegExp = /!tip/;
        const response: string = "<:cfbANY:1201985868319948831> ???\nhttps://streamelements.com/carefreebomb/tip";

        if (regex.test(message.content)) {
            await message.reply(response);
        }
    }
}