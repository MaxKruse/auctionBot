

module.exports = {
    data: {
        name: "settings",
        description: "View the settings for the bot",
    },
    handler: async (interaction, _) => {
        // get all env settings from the config
        const env = require("../modules/config");
        const settings = Object.keys(env).map(key => `${key}: ${env[key]}`);

        // filter out sensitive data
        const filtered = settings.filter(s => !["TOKEN", "SPREADSHEET_ID", "SHEET_NAME"].includes(s.split(":")[0]));

        // send the settings
        interaction.reply({
            "ephemeral": true,
            "content": `Settings:`,
            "embeds": [
                {
                    "color": 5814783,
                    "fields": filtered.map(s => ({
                        "name": s.split(":")[0],
                        "value": s.split(":")[1],
                    })),
                }
            ]
        });
    }
}