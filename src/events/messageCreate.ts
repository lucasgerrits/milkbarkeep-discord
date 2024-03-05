import { Events, Message } from "discord.js";
import { Event } from "../classes/Event";
import { client } from "..";
import channelIDs from "../../data/channelIDs.json";

export default new Event(
    Events.MessageCreate,
    (message: Message) => {
        if (message.channel.id === channelIDs.anonymous) return;
        if (message.channel.id === channelIDs.chiliDog) {
            // this.messageHandler.chiliDogCheck(message);
        }
        client.messageHandler.milkCheck(message);
    }
);