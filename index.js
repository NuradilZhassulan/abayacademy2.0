const { Scenes: { Stage}, session} = require('telegraf')
const text = require('./modules/const')
const studentsScene = require('./modules/addStudent')
const resultScene = require('./modules/resultForAdmin')
const factOPScene = require('./modules/factOP')
const addOpScene = require('./modules/addOp')
const deleteOpScene = require('./modules/deleteOp')
const addBookScene = require('./modules/addBook')
const addMonthlyScene = require('./modules/addMonthly')
const express = require('express');
const expressApp = express();
require('dotenv').config()

const bot = text.bot
const url = text.url
const BOT_TOKEN = text.BOT_TOKEN

bot.telegram.setWebhook(`${url}/bot${BOT_TOKEN}`);
expressApp.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

const stage = new Stage([studentsScene, resultScene, factOPScene, addOpScene, deleteOpScene, addBookScene, addMonthlyScene])
bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
    try {
        const gsapi = text.gsapi
        const optUpdateOpId = text.optUpdateOpId
        let opId = ((await gsapi.spreadsheets.values.get(optUpdateOpId)).data.values).flat()
        if(ctx.chat.id === 400336335 || ctx.chat.id === 256177977 || ctx.chat.id === 275028553) {
            bot.telegram.sendMessage(ctx.chat.id, 'Привет 🤟️', {
                reply_markup: {
                    keyboard: [
                        ['Добавить ученика ✅', 'Книга 📖'],
                        ['Общий результат 👀','Факт ОП 🤑'],
                        ['Добавить ОПшника ➕', 'Кикнуть ОПшника ➖'],
                        ['Ежемесячник 🔃', 'Отмена 🚫']
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            })
        } else if(opId.find(item => item === (ctx.chat.id).toString())) {
            bot.telegram.sendMessage(ctx.chat.id, `Привет, ${ctx.message.from.first_name} ${ctx.message.from.last_name ? ctx.message.from.last_name: ''} ✌`, {
                reply_markup: {
                    keyboard: [['Добавить ученика ✅', 'Ежемесячник 🔃'],
                        ['Книга 📖', 'Отмена 🚫']],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            })
        } else {
            bot.telegram.sendMessage(ctx.chat.id, `Привет, ${ctx.message.from.first_name} ${ctx.message.from.last_name ? ctx.message.from.last_name: ''}    \nОбратитесь к администратору для доступа`)
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
    }
})

bot.hears('Добавить ученика ✅', async (ctx)=> {try {ctx.scene.enter('StudentWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})
bot.hears('Общий результат 👀', async(ctx)=> {try {ctx.scene.enter('resultWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})
bot.hears('Факт ОП 🤑', async (ctx)=> {try {ctx.scene.enter('factOPWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})
bot.hears('Добавить ОПшника ➕', async(ctx)=> {try {ctx.scene.enter('addOpWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})
bot.hears('Кикнуть ОПшника ➖', async(ctx)=> {try {ctx.scene.enter('deleteOpWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})
bot.hears('Книга 📖', async(ctx)=> {try {ctx.scene.enter('addBookWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})
bot.hears('Ежемесячник 🔃', async(ctx)=> {try {ctx.scene.enter('addMonthlyWizard')} catch (e) {await ctx.reply("что то пошло не так, обратитесь к разработчику")}})

bot.help((ctx) => ctx.reply('Если возникли вопросы по разработке, пишите сюда: @zhassulannuradil'))

bot.launch()

// bot.startWebhook(`${url}/bot${BOT_TOKEN}`);
// console.log(`${url}/bot${BOT_TOKEN}`)

expressApp.get('/', (req, res) => {
    res.send('Hello World!');
});
expressApp.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))