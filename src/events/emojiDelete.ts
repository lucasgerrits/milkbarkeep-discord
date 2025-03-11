import { EmbedBuilder, Events, GuildEmoji, TextChannel } from "discord.js";
import { Event } from "../core/Event";
import { client } from "..";

export default new Event(
    Events.GuildEmojiDelete,
    async (emote: GuildEmoji) => {
        // Determine if emote logs are enabled in guild
        const guildId: string = emote.guild.id;
        const isFeedEnabled: boolean = await client.settingsManager.isFeatureEnabled(guildId, "emoteFeed");
        if (!isFeedEnabled) return;

        // Create embed
        const slotsString: string = await client.emotes.getSlotsString(guildId);
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .setTitle(`Deleted :${emote.name}:`)
            .setThumbnail(emote.imageURL())
            .setDescription(slotsString);

        // Send message to relevant channel
        const channelId: string = await client.settingsManager.getChannelId(guildId, "emoteFeed");
        const channel: TextChannel = client.channels.cache.get(channelId) as TextChannel;
        await channel.send({ embeds: [ embed ] });
    }
);