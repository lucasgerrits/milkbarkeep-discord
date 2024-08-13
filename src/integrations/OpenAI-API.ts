import OpenAI from 'openai';
import { Moderation } from 'openai/resources/moderations';
import { Message, MessageResolvable } from 'discord.js';
import { openAI as apiKey } from "../../data/apiKeys.json";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { client } from "..";

export class OpenAIApi {
    public readonly model: string = "gpt-3.5-turbo";

    private openAI: OpenAI;
    private key: string;
    private conversation: Array<ChatCompletionMessageParam>;
    private maxChars: number = 500;

    private rpLore: string = `
        You are a Discord chat bot that is stylized as a German bartender robot at The Milk Bar. Your name is MilkBarkeep (Barkeep for short), and you are the virtual assistant of the Discord server's admin CareFreeBomb (who is also a Twitch streamer). The community of which is centered around video games, nerd culture, sharing food and pet photos, cooking, lewd jokes, crude humor, programming, memes, puns, retro tech, music (electronic, drum and bass, rock, grunge, nu metal, 90s europop, alternative, hip hop, video game soundtracks) and contains ages ranging from 20s to 40s. You are vaguely aware that you are simply a mess of TypeScript code, and may rarely break the fourth wall. Some weird jokes here and there wouldn't hurt. If you feel the need to use a German accent, dialect, or words at any point for flavor, go nuts. Just remember that it's an English speaking community, so don't send entire messages in German because we won't understand. You hate The Man (aka corporations and corrupt government). You also really, really love milk.
        
        Members of the server will be tagging you in messages with requests, questions, and general assistance. Please respond (summarily without over-explaining too much as Discord screen estate is limited and no one likes to read a novel) and try and keep your responses under a maximum of ${this.maxChars} characters. Thank you!
    `;

    constructor(maxChars: number = 500) {
        this.key = apiKey;
        this.openAI = new OpenAI({
            apiKey: this.key,
        });
        this.maxChars = maxChars;
        this.conversation = [];
        // Add bot's character lore to front of end of conversation array
        const param: ChatCompletionMessageParam = { role: "user", content: this.rpLore };
        this.conversation.push(param);
    }

    private async isModerationFlagged(contentToModerate: string): Promise<boolean> {
        const params: OpenAI.ModerationCreateParams = {
            input: contentToModerate,
            model: "text-moderation-latest",
        }

        const response: OpenAI.Moderations.ModerationCreateResponse = await this.openAI.moderations.create(params);
        const results: Array<Moderation> = response.results;
        const result: Moderation = results[0];

        return result.flagged;
    }

    private async checkDiscordMessageReference(message: Message): Promise<void> {
        // Recursively call until first message in reply chain
        if (message.reference !== null) {
            const referencedMessage: Message = await message.channel.messages.fetch(message.reference.messageId as MessageResolvable);
            await this.checkDiscordMessageReference(referencedMessage)
        }
        // Then add this message as the next in the message chain array
        const role: "assistant" | "user" = (message.author.displayName === client.user?.displayName) ? "assistant" : "user";
        const param: ChatCompletionMessageParam = { role: role, content: message.content, name: message.author.displayName };
        this.conversation.push(param);
    }

    public async chat(message: string | Message): Promise<string> {
        const prompt: string = (message instanceof Message) ? message.content : message;
        
        // Check for content that violates any moderation categories
        if (await this.isModerationFlagged(prompt) === true) {
            const modStatement: string = `
                Can you rephrase the following or write something similar in your own words (based on your previously stated character): I'm sorry, but this request violates my content moderation rules.
            `;
            const param: ChatCompletionMessageParam = { role: "user", content: modStatement }
            this.conversation.push(param);
        } else {
            if (message instanceof Message) {
                await this.checkDiscordMessageReference(message);
            } else {
                const param: ChatCompletionMessageParam = { role: "user", content: prompt }
                this.conversation.push(param);
            }
        }

        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            messages: this.conversation,
            model: this.model,
        }

        const chatCompletion: OpenAI.Chat.ChatCompletion = await this.openAI.chat.completions.create(params);
        const resultText: string = chatCompletion.choices[0].message.content ?? "Chat completion error";
        return resultText;
    }
}