
module.exports = {
    sendToAllGuilds: function(bot, text)
    {
        bot.channels.filter(w => w.name === 'path-of-exile-bot').forEach(channel => {
            channel.send(text)
        });
    },
    createPoeChannels: function(bot)
    {
        bot.guilds.forEach(guild => {
            if(!guild.channels.some(x => x.name === 'path-of-exile-bot')) {
                guild.createChannel('path-of-exile-bot', { type: 'text' });
            }
        });
    }
}