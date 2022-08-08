const {SlashCommandBuilder} = require('discord.js');
require('../mechanics.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Build and Display current L Leaderboard.")
        .addBooleanOption(option => option.setName('choice').setDescription("ephemeral?")),
    async execute(interaction){
        await interaction.reply({content: "Fetching leaderboard...", ephemeral: interaction.options.getBoolean('choice')});
    },
}