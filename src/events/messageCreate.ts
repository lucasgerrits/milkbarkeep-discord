import { Events, Message, User } from "discord.js";
import { Event } from "../classes/Event";
import { client } from "..";
import channelIDs from "../../data/channelIDs.json";
import { OpenAIApi } from "../integrations/OpenAI-API";

export default new Event(
    Events.MessageCreate,
    async (message: Message) => {
        if (message.channel.id === channelIDs.anonymous) return;
        if (message.channel.id === channelIDs.chiliDog) {
            // this.messageHandler.chiliDogCheck(message);
        }
        client.messageHandler.milkCheck(message);
        client.messageHandler.tipCheck(message);

        if (message.mentions.has(client.user as User)) {
            // API call
            const openAI = new OpenAIApi();
            const response = await openAI.chat(message);
            // Reply
            await message.reply(response);
        }


    }
);