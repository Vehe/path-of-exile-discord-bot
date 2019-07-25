const fs = require('fs');

module.exports = {
	name: 'config',
	usage: '.config',
	description: 'Se utiliza para la configuración inicial del bot.',
	execute(message, args) {

        // Si no tiene dos argumentos saldremos del comando.
        if (args.length < 2) return;

        const posibleLeagues = ['Legion', 'HCL', 'Standard', 'Hardcore']
        const configFile = JSON.parse(fs.readFileSync('config.json'));

        if (args[0] == 'league') {

            const leaguePosition = posibleLeagues.indexOf(args[1].match(/\[(.*?)\]/)[1]);
            if (leaguePosition > -1) {

                // Escribimos la nueva configuración.
                configFile.league = posibleLeagues[leaguePosition];
                fs.writeFile('config.json', JSON.stringify(configFile), function (err) { 
                    return (err) ? console.log(err) : message.reply('Configuración Actualizada!');
                });

            } else {

                return message.reply('Oh, Oh! No ha sido posible actualizar la configuración!');
                
            }
            

        } else if (args[0] == 'refresh') {

            const refreshMins = args[1].match(/\[(.*?)\]/)[1];

            // Comprobamos si lo introducido puede ser convertido a numero.
            if (isNaN(refreshMins)) return message.reply('Oh, Oh! No ha sido posible actualizar la configuración!');
            
            // Escribimos la nueva configuración.
            configFile.refresh = refreshMins;
            fs.writeFile('config.json', JSON.stringify(configFile), function (err) { 
                return (err) ? console.log(err) : message.reply('Configuración Actualizada!');
            });

        }

	},
};