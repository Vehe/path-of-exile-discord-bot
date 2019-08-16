const request = require('request');
const cron = require('node-cron');

var bot;

module.exports = {
    setInitialAlerts: function(clientBot)
    {
        bot = clientBot;
        if(!bot.mongostatus) return; // ! SET MSG

        const alertsCollection = bot.db.collection('alerts');

        // Por cada guild creamos un array con las alertas que esta tiene.
        bot.guilds.forEach(guild =>
        {
            bot.alerts.set(guild.id, []);
            bot.botCurrentChannel = guild.channels.find(channel => channel.name === 'path-of-exile-bot');

            // Buscamos las alertas de la guild.
            alertsCollection.find({ guildId: guild.id }).toArray((error, guildAlerts) =>
            {
                if(error) return console.log('error on find alerts'); // ! SET MSG

                // Establecemos un cron sobre cada una de las alertas.
                guildAlerts.forEach(alert =>
                {
                    this.setAlert(alert);
                });

            });
        });
    },
    setAlert: function(alertElem)
    {
        const actualAlerts = bot.alerts.get(alertElem.guildId);

        // Creamos un nuevo cron para una tarea determinada.
        var alertCron = cron.schedule(`*/${alertElem.refresh} * * * *`, () =>{
            showAlertToUser(alertElem);
        }, { scheduled: false });

        // Guardamos el cron en un Map identificado por el guild id.
        alertCron.alert = alertElem.itemName;
        actualAlerts.push(alertCron);
        bot.alerts.set(alertElem.guildId, actualAlerts);

        // Iniciamos la ejecución de los cron.
        bot.alerts.get(alertElem.guildId).forEach(cronAlert => {
            cronAlert.start();
        });

        /**
         * Realiza la petición a la API para obtener los datos sobre el item del cual
         * se estableció la alerta.
         */
        function showAlertToUser(alert)
        {
            if(alert.class == 'Currency' || alert.class == 'Fossils')
            {
                request({ url: `https://poe.ninja/api/data/currencyoverview?league=Legion&type=${alert.class.replace(/\s+/g,'')}`, json:true }, function (error, response, json)
                {
                    if(error) return console.log('error on request'); // ! SET MSG
                    if(response.statusCode != 200) return console.log('not 200 status'); // ! SET MSG
                    parseDataCurrencyOverview(json, alert);
                });
            }
            else
            {
                request({ url: `https://poe.ninja/api/data/itemoverview?league=Legion&type=${alert.class.replace(/\s+/g,'')}`, json:true }, function (error, response, json)
                {
                    if(error) return console.log('error on request'); // ! SET MSG
                    if(response.statusCode != 200) return console.log('not 200 status'); // ! SET MSG
                    parseDataItemOverview(json, alert);
                });
            }
        }

        /**
         * Se encarga de procesar el json de los items con clase Currency o Fossils.
         */
        function parseDataCurrencyOverview(data, alert)
        {
            const currencyDetails = data['currencyDetails'];
            const lines = data['lines'];
            const itemData = lines.find(item => item['detailsId'] == alert.itemName);
            console.log(itemData);
        }

        /**
         * Se encarga de procesar el json de los items que no correspondan con las clases Currency o Fossils.
         */
        function parseDataItemOverview(data, alert)
        {
            const lines = data['lines'];
            const itemData = lines.find(item => item['detailsId'] == alert.itemName);
            console.log(itemData);
        }
    }
};