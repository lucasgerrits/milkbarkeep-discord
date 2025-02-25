import { Message, MessageResolvable, User } from "discord.js";
import { EmbedFixManager } from "./EmbedFixManager";
import { GoogleGeminiApi } from "../integrations/GoogleGemini-API";
import { Logger } from "../util/Logger";
import { Util } from "../util/Util";
import { client } from "..";
import channelIDs from "../../data/channelIDs.json";

export class MessageHandler{
    constructor() {}

    public async checkMessage(message: Message): Promise<void> {
        // ENFORCEMENT CHECKS
        if (message.channel.id === channelIDs.bombsquad.channels.anonymous) return;
        this.chiliDogCheck(message);

        // REACT CHECKS
        this.milkCheck(message);

        // COMMAND CHECKS
        // Convert this to some kind of colllection for non-slash macro commands
        this.tipCheck(message);

        // MISC CHECKS
        EmbedFixManager.check(message);
        this.getAIResponse(message);
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

    private async chiliDogCheck(message: Message): Promise<void> {
        if (message.channel.id !== channelIDs.bombsquad.channels.chiliDog) return;
        // const regex = new RegExp("^(<:cfbOrb:950146443170164767>){1}$");
        const regex: RegExp = new RegExp("^(suckin on a chili dog){1}$");
        if (regex.test(message.content) === false) {
            message.delete();
        }
    }

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