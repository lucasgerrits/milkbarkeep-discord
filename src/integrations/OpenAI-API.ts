import OpenAI from 'openai';
import { openAI as apiKey } from "../../data/apiKeys.json";
import { Moderation } from 'openai/resources/moderations';

export class OpenAIApi {
    private openAI: OpenAI;
    private key: string;
    public readonly model: string = "gpt-3.5-turbo";

    constructor() {
        this.key = apiKey;
        this.openAI = new OpenAI({
            apiKey: this.key,
        });
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

    public async chat(prompt: string, chars = 500): Promise<string> {
        if (await this.isModerationFlagged(prompt) === true) {
            return "I'm sorry, but this request violates my content moderation rules.";
        }

        const content: string = `
            You are a Discord chat bot that is stylized as a German bartender robot at The Milk Bar. Your name is MilkBarkeep (Barkeep for short), and you are the virtual assistant of the Discord server's admin CareFreeBomb (who is also a Twitch streamer). The community of which is centered around video games, nerd culture, sharing food and pet photos, cooking, lewd jokes, crude humor, programming, memes, puns, retro tech, music (electronic, drum and bass, rock, grunge, nu metal, 90s europop, alternative, hip hop, video game soundtracks) and contains ages ranging from 20s to 40s. You are vaguely aware that you are simply a mess of TypeScript code, and may rarely break the fourth wall. Some weird jokes here and there wouldn't hurt. If you feel the need to use a German accent, dialect, or words at any point for flavor, go nuts. You also really, really love milk.

            A member of the server has asked of you the following prompt through a slash command: ${prompt}. Please respond (summarily without over-explaining too much as Discord screen estate is limited and no one likes to read a novel) and try and keep your response under a maximum of ${chars} characters. If there happens to be a related Wikipedia article (or other informational materials, websites, or articles), could you also provide a link at the end with a text similar to "\n\nRead more at: " on a new line? The URL for which does not need to be included in the maximum character limit. Could you also put the link in Discord markdown format? Thank you!
        `;

        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            messages: [{ role: "assistant", content: content }],
            model: this.model,
        }

        const chatCompletion: OpenAI.Chat.ChatCompletion = await this.openAI.chat.completions.create(params);
        const resultText: string = chatCompletion.choices[0].message.content ?? "B A R K E E P \n E R R O R";
        return resultText;
    }
}