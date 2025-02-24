export type GuildSettingsJson = {
    id: string;
    memo: string;
    channels: { [key in ChannelName]: string };
    features: { [key in FeatureName]: boolean };
    commands: string[];
}

export type BirthdaysJson = {
    userId: string;
    date: string;
}

export type FeatureName = 
    "birthdays" |
    "oddball" |
    "ra";

export type ChannelName =
    "anonymous" |
    "appletonCam" |
    "birthdays" |
    "chiliDog" |
    "general" |
    "logging" |
    "oddball" |
    "ponder" |
    "raFeed" |
    "rules" |
    "testing" |
    "tree" |
    "welcome";