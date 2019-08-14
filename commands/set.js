const Discord = require('discord.js');

module.exports = {
    name: 'set',
    usage: '.set',
    description: 'Se utiliza para establecer alertas sobre un objeto.',
    execute(message, args) 
    {
        if(args[0].startsWith('['))
        {
            var itemName = getItemName();

            if(itemName)
            {
                if(!message.client.mongostatus) return noConnection();
                
                const allItems = message.client.db.collection('all');

                allItems.find({name:{$regex:`.*${itemName}`, $options:"i"}}).toArray(function(err, result)
                {
                    if(err) return message.reply('Error al buscar en la base de datos.');
                    if(result.length < 1) return message.reply('No se ha encontrado el item buscado.');
                    if(result.length > 1) return tooManyItems(result);

                    return message.reply(result[0].showName);
                });
                
            }
        }
        else
        {
            return help();
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

            // Aplicamos algunos filtros.
            itemName = itemName.slice(1,-2);
            itemName = itemName.replace(/\s+/g, '').toLowerCase();
            itemName = itemName.replace(/'/g, '');

            var finalName = '';
            for(var i = 0; i < itemName.length; i++) finalName = finalName.concat(itemName.charAt(i), '.*');

            return finalName;
        }

        /**
         * Le indicamos al usuario que se han encontrado varios objetos con un nombre similar.
         */
        function tooManyItems(results)
        {
            if(results.length > 10) return message.reply('Porfavor, intenta reducir el número de resultados.');

            var itemsMessage = {
                color: 0xbf0a30,
                description:'\u200b',
                author: {
                name: 'Se han encontrado varios resultados, selecciona el item deseado.',
                icon_url: 'https://www.pathofexile.com/image/war/logo.png'
                },
                fields: [],
                timestamp: new Date(),
                footer: {
                    text: 'Vuelve a escribir el comando con el nombre completo del item.'
                }
            };

            results.forEach(x => {
                var emo = message.client.emojis.find(emoji => emoji.name === x.class.replace(/\s+/g, ''));
                var newField = { name: x.showName, value:`${emo} ${x.class}` }
                itemsMessage.fields.push(newField);
            });

            message.channel.send({"embed":itemsMessage});
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

        /**
         * Mensaje de error para cuando perdemos la conexion con al base de datos.
         * ! TODO.
         */
        function noConnection()
        {
            message.reply('No hay conexion con la base de datos');
        }
        
    },

};