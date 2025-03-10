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
        if (!oldChannel && !newChannel) return;

        if (!oldChannel && newChannel) {
            Logger.log(`${newChannel.guild.name} (${newChannel.guildId}): ${member.displayName} (${member.id}) joined voice channel ${newChannel.name} (${newChannel.id})`);
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `${member.displayName} joined voice`, iconURL: member.user.displayAvatarURL() });
            await newChannel.send({ embeds: [ embed ] });
        } else if (oldChannel) {
            Logger.log(`${oldChannel.guild.name} (${oldChannel.guildId}): ${member.displayName} (${member.id}) left voice channel ${oldChannel.name} (${oldChannel.id})`);
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("Red")
                .setAuthor({ name: `${member.displayName} left voice`, iconURL: member.user.displayAvatarURL() });
            await oldChannel.send({ embeds: [ embed ] });
        }
    }
);