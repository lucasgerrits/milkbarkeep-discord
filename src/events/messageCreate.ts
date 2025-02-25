import { Events, Message } from "discord.js";
import { Event } from "../core/Event";
import { client } from "..";


export default new Event(
    Events.MessageCreate,
    async (message: Message) => {
        client.messageHandler.checkMessage(message);
    }
);