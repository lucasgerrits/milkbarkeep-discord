export type GuildSettingsJson = {
    id: string;
    memo: string;
    channels: { [key in ChannelName]: string };
    features: { [key in FeatureName]: boolean };
    commands: string[];
    welcomeMessage: string;
}

export type BirthdaysJson = {
    userId: string;
    date: string;
}

export type FeatureName = 
    "birthdays" |
    "oddball" |
    "ra" |
    "welcome";

export type ChannelName =
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