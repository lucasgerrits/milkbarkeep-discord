import { EmbedBuilder, Events, GuildMember, Message, VoiceBasedChannel, VoiceChannel, VoiceState } from "discord.js";
import { Event } from "../core/Event";
import { Logger } from "../util/Logger";
import { client } from "..";

export default new Event(
    Events.VoiceStateUpdate,
    async (oldState: VoiceState, newState: VoiceState) => {
        const member: GuildMember | null = newState.member || oldState.member;
        if (!member) return;

        const oldChannel: VoiceBasedChannel | null = oldState.channel;
        const newChannel: VoiceBasedChannel | null = newState.channel;

        const oldChannelId: string | null = oldState.channelId;
        const newChannelId: string | null = newState.channelId;

        const oldStreaming: boolean | null = oldState.streaming;
        const newStreaming: boolean | null = newState.streaming;

        const oldVideo: boolean | null = oldState.selfVideo;
        const newVideo: boolean | null = newState.selfVideo;

        const oldSessionId = oldState.sessionId;
        const newSessionId = newState.sessionId;

        // Joins and disconnects
        if (oldChannelId !== newChannelId) {
            // Tell new channel user joined
            if (newChannel) {
                Logger.log(`${newChannel?.guild.name}: ${member.displayName} joined voice channel ${newChannel?.name}`);
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Green")
                    .setAuthor({ name: `${member.displayName} joined voice`, iconURL: member.user.displayAvatarURL() });
                await newChannel?.send({ embeds: [ embed ] });
            }

            // Tell old channel user switched to channel in same guild or disconnected
            if ((oldChannel && newChannel) && (oldChannel.guildId === newChannel.guildId)) {
                Logger.log(`${newChannel?.guild.name}: ${member.displayName} switched from ${oldChannel?.name} to ${newChannel?.name}`);
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: `${member.displayName} switched to 🔊${newChannel?.name}`, iconURL: member.user.displayAvatarURL() });
                await oldChannel?.send({ embeds: [ embed ] });
            } else if (oldChannel) {
                Logger.log(`${oldChannel?.guild.name}: ${member.displayName} left voice channel ${oldChannel?.name}`);
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `${member.displayName} left voice`, iconURL: member.user.displayAvatarURL() });
                await oldChannel?.send({ embeds: [ embed ] });
            }
        }
    }
);