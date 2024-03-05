import { Message } from "discord.js";

export class MessageHandler{
    constructor() {}

    public async chiliDogCheck(message: Message): Promise<void> {
        // const regex = new RegExp("^(<:cfbOrb:950146443170164767>){1}$");
        const regex: RegExp = new RegExp("^(suckin on a chili dog){1}$");
        if (regex.test(message.content) === false) {
            message.delete();
        }
    }

    public async milkCheck(message: Message): Promise<void> {
        const melkEmote: string = "melk:616025879830855681";
        const milkStrings: string[] = ["milk", "melk", "malk", "mork"];
        const milkRegex: RegExp = new RegExp(milkStrings.join("|"), "i");

        if (milkRegex.test(message.content)) {
            message.react(melkEmote);
        }
    }
}