module.exports = {
	name: 'ready', //states which event this file is for
	once: true,     //specifies if the event should run only once
	execute(client) {   //executes following logic, which will be called by event handler wherever the event emits
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};