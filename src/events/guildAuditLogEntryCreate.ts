import { AuditLogEvent, EmbedBuilder, Events, Guild, GuildAuditLogsEntry, TextChannel, User, channelMention, roleMention, userMention } from "discord.js";
import { Event } from "../classes/Event";
import { Timestamps } from "../classes/Timestamps";
import { client } from "..";
import channelIDs from "../../data/channelIDs.json";

export default new Event(
    Events.GuildAuditLogEntryCreate,
    async (entry: GuildAuditLogsEntry, guild: Guild) => {
        /*
        // Account for undefined values
        const executor: User = entry.executor as User;

        if ((entry.action === AuditLogEvent.ChannelUpdate && entry.executor?.displayName === "MineBarkeep") ||
            (entry.action === AuditLogEvent.MemberRoleUpdate && entry.executor?.displayName === "YAGPDB.xyz") ||
            (entry.action === AuditLogEvent.MessageDelete && entry.executor?.displayName === "CFB")) {
            return;
        }

        // Get event details
        const auditTime: string = Timestamps.default(new Date());
        const relativeTime: string = Timestamps.relative(new Date());

        // Format logging strings
        const timeStr: string = `${auditTime} (${relativeTime})`;
        const actionStr: string = `${entry.actionType} ${entry.targetType}`;

        // Determine target type and create mention
        const targetId = entry.targetId as string;
        let targetStr: string;
        if (entry.targetType === "User") {
            targetStr = userMention(targetId);
        } else if (entry.targetType === "Channel") {
            targetStr = channelMention(targetId);
        } else if (entry.targetType === "Role") {
            targetStr = roleMention(targetId);
        } else {
            targetStr = targetId;
        }

        // Create embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("Audit Log Entry")
            .addFields([
                { name: "Executor: ", value: userMention(executor.id), inline: true },
                { name: "Action: ", value: actionStr },
                { name: "Target: ", value: targetStr },
                { name: "Entry ID: ", value: entry.id, inline: false },
                { name: "Timestamp: ", value: timeStr, inline: false },
            ]);

        // Send logging message to Discord channel
        const loggingChannelId: string = channelIDs.logging;
        const loggingChannel: TextChannel = client.channels.cache.get(loggingChannelId) as TextChannel;
        await loggingChannel.send({
            embeds: [embed],
        });
        */
    }
);