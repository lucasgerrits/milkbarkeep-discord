import { Message, User } from "discord.js";
import { EmbedFixManager } from "./EmbedFixManager";
import { client } from "..";
import channelIDs from "../../data/channelIDs.json";

export class MessageHandler{
    constructor() {}

    public async checkMessage(message: Message): Promise<void> {
        if (message.channel.id === channelIDs.anonymous) return;
        if (message.channel.id === channelIDs.chiliDog) {
            // this.messageHandler.chiliDogCheck(message);
        }
        this.milkCheck(message);
        this.tipCheck(message);

        EmbedFixManager.check(message);

        if (message.mentions.has(client.user as User)) {
            /** OpenAI API stopped giving free trials, disabling until a better solution is researched
            // API call
            const openAI = new OpenAIApi();
            const response = await openAI.chat(message);
            // Reply
            await message.reply(response);
            */
        }
    }

    private async chiliDogCheck(message: Message): Promise<void> {
        // const regex = new RegExp("^(<:cfbOrb:950146443170164767>){1}$");
        const regex: RegExp = new RegExp("^(suckin on a chili dog){1}$");
        if (regex.test(message.content) === false) {
            message.delete();
        }
    }

    private async milkCheck(message: Message): Promise<void> {
        const melkEmote: string = "melk:616025879830855681";
        const milkStrings: string[] = ["milk", "melk", "malk", "mork"];
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