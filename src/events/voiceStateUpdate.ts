import { EmbedAuthorOptions, EmbedBuilder, Events, GuildMember, Message, VoiceBasedChannel, VoiceChannel, VoiceState } from "discord.js";
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
        
        const log = function(str: string) {
            Logger.log(`[Voice] ${oldChannel?.guild.name} - ${member.displayName} ${str}`, "brightBlack");
        }

        // Joins and disconnects
        if (oldChannelId !== newChannelId) {
            // Tell old channel user switched to channel in same guild or disconnected
            if ((oldChannel && newChannel) && (oldChannel.guildId === newChannel.guildId)) {
                log(`left voice channel ${oldChannel?.name}`);
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `${member.displayName} left to 🔊${newChannel?.name}`, iconURL: member.user.displayAvatarURL() });
                await oldChannel?.send({ embeds: [ embed ] });
            } else if (oldChannel) {
                log(`left voice channel ${oldChannel?.name}`);
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `${member.displayName} left voice`, iconURL: member.user.displayAvatarURL() });
                await oldChannel?.send({ embeds: [ embed ] });
            }

            // Tell new channel user joined
            if (newChannel) {
                log(`joined voice channel ${newChannel?.name}`);
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Green")
                    .setAuthor({ name: `${member.displayName} joined voice`, iconURL: member.user.displayAvatarURL() });
                await newChannel?.send({ embeds: [ embed ] });
            }
        // Streaming starts and stops
        } else if (oldStreaming !== newStreaming) {
            log(`${newStreaming ? "started" : "stopped"} streaming in ${oldChannel?.name}`);
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(`${newStreaming ? "Purple" : "NotQuiteBlack"}`)
                .setAuthor({ name: `${member.displayName} ${newStreaming ? "started" : "stopped"} streaming`, iconURL: member.user.displayAvatarURL() });
            await oldChannel?.send({ embeds: [ embed ] });
        }
    }
);