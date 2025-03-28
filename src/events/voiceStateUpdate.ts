import { EmbedBuilder, Events, Guild, GuildMember, VoiceBasedChannel, VoiceState } from "discord.js";
import { Event } from "../core/Event";
import { Logger } from "../core/Logger";

export default new Event(
    Events.VoiceStateUpdate,
    async (oldState: VoiceState, newState: VoiceState) => {
        const oldChannel: VoiceBasedChannel | null = oldState.channel;
        const newChannel: VoiceBasedChannel | null = newState.channel;
        const oldChannelId: string | null = oldState.channelId;
        const newChannelId: string | null = newState.channelId;
        const guild: Guild = (newChannel?.guild ?? oldChannel?.guild) as Guild;

        // Check for caching issue with member data
        let member: GuildMember | null = newState.member || oldState.member;
        if (!member) {
            try{
                member = await guild.members.fetch(newState.id);
            } catch (error: any) {
                Logger.vc(`${guild.name} - Failed to fetch member: ${error}`);
                return;
            }
        }

        const oldStreaming: boolean | null = oldState.streaming;
        const newStreaming: boolean | null = newState.streaming;
        const oldSessionId = oldState.sessionId;
        const newSessionId = newState.sessionId;
        const oldVideo: boolean | null = oldState.selfVideo;
        const newVideo: boolean | null = newState.selfVideo;
        
        const log = function(channel: string, str: string) {
            Logger.vc(`${guild.name} ~ #${channel} - ${member.displayName} ${str}`);
        }

        // Joins and disconnects
        if (oldChannelId !== newChannelId) {
            // Tell old channel user switched to channel in same guild or disconnected
            if ((oldChannel && newChannel) && (oldChannel.guildId === newChannel.guildId)) {
                log(oldChannel?.name, "left voice channel");
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `${member.displayName} left to 🔊${newChannel?.name}`, iconURL: member.user.displayAvatarURL() });
                await oldChannel?.send({ embeds: [ embed ] });
            } else if (oldChannel) {
                log(oldChannel?.name, "left voice channel");
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `${member.displayName} left voice`, iconURL: member.user.displayAvatarURL() });
                await oldChannel?.send({ embeds: [ embed ] });
            }

            // Tell new channel user joined
            if (newChannel) {
                log(newChannel?.name, "joined voice channel");
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("Green")
                    .setAuthor({ name: `${member.displayName} joined voice`, iconURL: member.user.displayAvatarURL() });
                await newChannel?.send({ embeds: [ embed ] });
            }
        // Streaming starts and stops
        } else if (oldStreaming !== newStreaming) {
            log(oldChannel?.name as string, `${newStreaming ? "started" : "stopped"} streaming`);
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(`${newStreaming ? "Purple" : "NotQuiteBlack"}`)
                .setAuthor({ name: `${member.displayName} ${newStreaming ? "started" : "stopped"} streaming`, iconURL: member.user.displayAvatarURL() });
            await oldChannel?.send({ embeds: [ embed ] });
        // User switched devices
        } else if (oldSessionId !== newSessionId) {
            log(newChannel?.name as string, "switched devices");
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: `${member.displayName} switched devices`, iconURL: member.user.displayAvatarURL() });
            await newChannel?.send({ embeds: [ embed ]});
        }
        
    }
);