const { ADMIN_ROLE_ID, BIDDER_ROLE_ID, SPREADSHEET_ID, SHEET_NAME } = require('../modules/config');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
    data: {
        name: "reset",
        description: "Resets the database",
        options: [
            {
            name: "amount",
            type: "INTEGER",
            description: "The amount of currency to set to",
            required: false
            }
        ],
    },
    handler: async (interaction, db) => {

        // check if the user has the admin role
        if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
            interaction.reply({
                content: `You don't have the admin role!`,
                ephemeral: true,
            });
            return;
        }

        // amount of default money
        // get optional argument for amount
        const money = interaction.options.get("amount")?.value || 1000;

        // remove all bidders
        await db.run(`DELETE FROM bidders`);
        await interaction.guild.members.fetch();
        const bidders = interaction.guild.roles.cache.get(BIDDER_ROLE_ID).members.map(m => m.id);

        await db.run(`INSERT INTO bidders (discord_id, balance)
                    VALUES ${bidders.map(id => `(${id}, ${money})`).join(",")}`);

        // remove all bids
        await db.run(`DELETE FROM bids`);

        // reset all players
        await db.run(`DELETE FROM players`);
        
        // connect to google spreadsheets as per the config
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

        // Use the ServiceAccountAuth from auctionbot-auth.json
        await doc.useServiceAccountAuth(require('../auctionbot-auth.json'));

        // load the doc info
        await doc.loadInfo();
        console.log(`Loaded doc info: ${doc.title}`);

        // get the sheetname
        const sheet = doc.sheetsByTitle[SHEET_NAME];

        // format of the sheet will be: 
        // (user_id, username, country, rank)
        
        // get the data from the sheet
        const data = await sheet.getRows();

        // create an array of promises
        const promisesArray = [];
        let count = 0;
        
        // iterate over the data
        data.forEach(async (row) => {
            // create an array of data to insert
            const data = [
                row.user_id,
                row.username,
                row.country,
                row.rank,
            ];

            // insert the data into the database
            const p = db.run(`
                INSERT INTO players (user_id, username, country, rank)
                VALUES (?, ?, ?, ?)
            `, data);

            // push the promise into the array
            promisesArray.push(p);
            count++;
        });

        // wait for all promises to resolve
        await Promise.all(promisesArray);

        await interaction.reply({
            content: `Database reset! Inserted ${count} players, and gave all bidders $${money}`,
            ephemeral: true,
        })
    }
}
