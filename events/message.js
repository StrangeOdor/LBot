const {ambiguous} = require('../seed/ambiguous');
const {refuseMessages} = require('../seed/refuseMessages');
const {stirMessages} = require('../seed/stirMessages');
require('../seed/stirMessages');
function randAdd(){
    const selection = Math.floor(Math.random()*addmessages.length);
    return addmessages.at(selection);
}
function randStir(){
    const selection = Math.floor(Math.random()*stirMessages.length);
    return stirMessages.at(selection);
}

function randRefuse(){
    const selection = Math.floor(Math.random()*refuseMessages.length);
    return refuseMessages.at(selection);
}
module.exports = {
	name: 'messageCreate',    //states which event this file is for
	async execute(message) {       //executes following logic, which will be called by event handler wherever the event emits
		// console.log("message detected...");
        // console.log("message content: " + message.content);
        if(message.reference){
            const check = message.reference;
            if(ambiguous.has(message.content)){
                await message.reply(randStir());
            }
        };
	},
};