import { EmbedBuilder, Events, Message, PartialMessage, TextChannel, User, channelMention, userMention } from "discord.js";
import { Event } from "../core/Event";
import { Timestamps } from "../core/Timestamps";
import { client } from "..";

export default new Event(
    Events.MessageDelete,
    async (message: Message | PartialMessage) => {
        // Check for partial message
        // https://discordjs.guide/popular-topics/partials.html
        if (message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error("Error fetching partial message: ", error);
                return;
            }
        }

        // Account for undefined values
        message = message as Message;
        const author: User = message.author as User;

        const guildId: string = message?.guild?.id as string;

        // Determine if deletion should be logged at all due to settings, ignored channels, or bot message
        const modLoggingEnabled: boolean = await client.settings.isFeatureEnabled(guildId, "modLog");
        const channelShouldBeIgnored: boolean = (await client.settings.getUnloggedChannelIds(guildId)).includes(message.channelId);
        const authorIsBot: boolean = author.displayName === client.user?.displayName;
        if (!modLoggingEnabled || channelShouldBeIgnored || authorIsBot) { return; }

        // Get message and event details
        const content: string = (message.content.length >= 1) ? message.content : " ";
        const deletionTime: string = Timestamps.default(new Date());
        const relativeTime: string = Timestamps.relative(new Date());
        
        // Format logging strings
        const contentStr: string = `Message sent by ${userMention(author.id)} deleted in ` +
            `${channelMention(message.channelId)}\n\n\`\`\`${content}\`\`\``;
        const timeStr: string = `${deletionTime} (${relativeTime})`;
        
        // Create embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#9E0B0F")
            .setTitle("Message Deletion")
            .setDescription(`\`\`\`${content}\`\`\``)
            .addFields([
                { name: "Author: ", value: userMention(author.id), inline: true },
                { name: "Channel: ", value: channelMention(message.channelId), inline: true },
                { name: "Message ID: ", value: message.id, inline: false },
                { name: "Timestamp: ", value: timeStr, inline: false },
            ]);
        
        // Send logging message to Discord channel
        const loggingChannelId: string = await client.settings.getChannelId(guildId, "modLog");
        const loggingChannel: TextChannel = message.guild?.channels.cache.get(loggingChannelId) as TextChannel;
        await loggingChannel.send({
            embeds: [embed],
        });
    }
);