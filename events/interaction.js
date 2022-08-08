module.exports = {
	name: 'interactionCreate',    //states which event this file is for
	async execute(interaction) {       //executes following logic, which will be called by event handler wherever the event emits
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
	},
};