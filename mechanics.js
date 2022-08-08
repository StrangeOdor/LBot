const mongoose = require('mongoose');
const levels = require('./models/levels.js');


class DiscordL{
    static async setURL(dbUrl){
        if (!dbUrl) throw new TypeError("A database url was not provided.");
        return mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false  
        });
    }
    static async createUser(userId, guildId){
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        
        const isUser = await levels.findOne({userID: userId, guildID: guildId });
        if (isUser) return false;

        const newUser = new levels({
            userID: userId,
            guildID: guildId
        });

        await newUser.save().catch(e => console.log(`Failed to create user: ${e}`));
        return newUser;
    }

    static async deleteUser(userId, guildId){
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        
        const user = await levels.findOne({ userID: userId, guildID: guildId });
        if (!user) return false;
    
        await levels.findOneAndDelete({ userID: userId, guildID: guildId }).catch(e => console.log(`Failed to delete user: ${e}`));
    
        return user;
      }

      static async appendL(userId, guildId, Lcount){
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        if (Lcount ==0 || !Lcount || isNaN(parseInt(Lcount))) throw new TypeError("L amount was not provided/was invalid");
        
        const user = await levels.findOne({ userID: userId, guildID: guildId });

        if(!user){
            const newUser = new levels({
                userID: userId,
                guildID: guildId,
                Lcount: Lcount,
                level: 0
            });

            await newUser.save().catch(e => console.log(`Failed to save new user.`));

            return (Math.floor(Lcount/20) > 0);
        };
        user.Lcount += parseInt(Lcount,10);
        user.level = Math.floor(Lcount/20);
        user.lastUpdated = new Date();

        await user.save().catch(e => console.log(`Failed to append L: ${e}`));

        return (Math.floor((user.Lcount - Lcount)/20) < user.level); //What does this do exactly??
    }

    static async appendLevel(userId, guildId, level) {
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        if (!levelss) throw new TypeError("An amount of levels was not provided.");
        
        const user = await levels.findOne({ userID: userId, guildID: guildId });
        if (!user) return false;
    
        user.level += parseInt(level, 10);
        user.Lcount = (level*20);
        user.lastUpdated = new Date();
 
        user.save().catch(e => console.log(`Failed to append level: ${e}`) );

        return user;
    }

    async setLcount(userId, guildId, Lcount){
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        if (Lcount == 0 || !Lcount || isNaN(parseInt(Lcount))) throw new TypeError("An amount of L's was not provided/was invalid.");
        
        const user = await levels.findOne({ userID: userId, guildID: guildId });
        if (!user) return false;
    
        user.Lcount = Lcount;
        user.level = Math.floor(Lcount/20);
        user.lastUpdated = new Date();
      
        user.save().catch(e => console.log(`Failed to set Lcount: ${e}`) );
    
        return user;
    }
    static async setLevel(userId, guildId, level) {
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        if (!level) throw new TypeError("A level was not provided.");
    
        const user = await levels.findOne({ userID: userId, guildID: guildId });
        if (!user) return false;
    
        user.level = level;
        user.Lcount = level*20;
        user.lastUpdated = new Date();
        
        user.save().catch(e => console.log(`Failed to set level: ${e}`) );
    
        return user;
      }
      static async fetch(userId, guildId, fetchPosition = false) {
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
    
        const user = await levels.findOne({
          userID: userId,
          guildID: guildId
        });
        if (!user) return false;
    
        if (fetchPosition === true) {
          const leaderboard = await levels.find({
            guildID: guildId
          }).sort([['Lcount', 'descending']]).exec();
    
          user.position = leaderboard.findIndex(i => i.userID === userId) + 1;
        }
        /* To be used with canvacord*/
        user.cleanL = user.Lcount - this.LcountFor(user.level);
        user.cleanNextLevelLcount = this.LcountFor(user.level + 1) - this.LcountFor(user.level);
    
        return user;
    }
    static async  subtractLevel(userId, guildId, level){
        if (!userId) throw new TypeError("An user id was not provided.");
        if (!guildId) throw new TypeError("A guild id was not provided.");
        if (!level) throw new TypeError("An amount of levels was not provided.");
        
        const user = await levels.findOne({ userID: userId, guildID: guildId });
        if (!user) return false;

        user.level -= level;
        user.Lcount = user.level*20;
        user.lastUpdated = new Date();
    
        user.save().catch(e => console.log(`Failed to subtract levels: ${e}`) );

        return user;
    }
    static async fetchLeaderboard(guildId, limit) {
        if (!guildId) throw new TypeError("A guild id was not provided.");
        if (!limit) throw new TypeError("A limit was not provided.");
    
        const users = await levels.find({ guildID: guildId }).sort([['Lcount', 'descending']]).limit(limit).exec();
    
        return users;
      }

    static async computeLeaderboard(client, leaderboard, fetchUsers = false) {
    if (!client) throw new TypeError("A client was not provided.");
    if (!leaderboard) throw new TypeError("A leaderboard id was not provided.");

    if (leaderboard.length < 1) return [];

    const computedArray = [];

    if (fetchUsers) {
      for (const key of leaderboard) {
        const user = await client.users.fetch(key.userID) || { username: "Unknown", discriminator: "0000" };
        computedArray.push({
          guildID: key.guildID,
          userID: key.userID,
          Lcount: key.Lcount,
          level: key.level,
          position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
          username: user.username,
          discriminator: user.discriminator
        });
      }
    } else {
      leaderboard.map(key => computedArray.push({
        guildID: key.guildID,
        userID: key.userID,
        Lcount: key.Lcount,
        level: key.level,
        position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
        username: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).username : "Unknown",
        discriminator: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).discriminator : "0000"
      }));
    }

    return computedArray;
  }
  static LcountFor (targetLevel) {
    if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError("Target level should be a valid number.");
    if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
    if (targetLevel < 0) throw new RangeError("Target level should be a positive number.");
    return targetLevel * 20;
  }

  static async deleteGuild(guildId) {
    if (!guildId) throw new TypeError("A guild id was not provided.");
    const guild = await levels.findOne({ guildID: guildId });
    if (!guild) return false;
    await levels.deleteMany({ guildID: guildId }).catch(e => console.log(`Failed to delete guild: ${e}`));
    return guild;
  } 
}

module.exports = DiscordL;