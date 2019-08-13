const Discord = require('discord.js');

module.exports = {
    name: 'set',
    usage: '.set',
    description: 'Se utiliza para establecer alertas sobre un objeto.',
    execute(message, args) 
    {
        if(args[0].startsWith('['))
        {
            const itemName = getItemName();

            if(itemName)
            {
                const allItems = message.client.db.collection('all');

                allItems.findOne({showName: itemName}, (err, item) => {
                    // TODO:
                    if(err) return;

                    if(item)
                    {
                        console.log(item);
                    }
                });
            }
        }

        /**
         * Devuelve el nombre del item introducido como argumeto.
         */
        function getItemName()
        {
            const lastOne = args.find(a => a.endsWith(']'));

            if(!lastOne) return help();

            const argPosition = args.indexOf(lastOne);

            var itemName = '';

            for(var i = 0; i <= argPosition; i++) itemName = itemName.concat(args[i], ' ');

            return itemName.slice(1,-2);
        }

        /**
         * Mensaje de ayuda para las alertas.
         */
        function help()
        {
            const configUsage = new Discord.RichEmbed()
                .setColor('#bf0a30')
                .setAuthor('Path Of Exile BOT', 'https://www.pathofexile.com/image/war/logo.png')
                .setThumbnail('https://www.pathofexile.com/image/war/logo.png')
                .setFooter('Cuando acabes de configurarme podrás comenzar.');

            message.channel.send(configUsage);
        }
        
    },

};