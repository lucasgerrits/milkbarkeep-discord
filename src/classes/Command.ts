import { ChatInputApplicationCommandData, SlashCommandBuilder } from "discord.js";
import type { CommandType, RunFunction } from "../types/CommandTypes";

export class Command implements ChatInputApplicationCommandData {
    public name: string;
    public description: string;
    public run: RunFunction;
    // public builder: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    

    constructor(commandData: CommandType) {
        this.name = commandData.name;
        this.description = commandData.description;
        this.run = commandData.run;
    }
}