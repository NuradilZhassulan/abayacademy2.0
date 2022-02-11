const { Composer, Scenes: { WizardScene }} = require('telegraf')
const text = require("./const");

const startStep = new Composer()
startStep.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data = {}
            await ctx.replyWithHTML("Отправь контакт 👇")
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const addContract = new Composer()
addContract.use(async (ctx) => {
    try {
        if(ctx.update.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            if(ctx.update.message.contact.user_id !== undefined) {
                let user_id = (ctx.update.message.contact.user_id).toString()
                const gsapi = text.gsapi
                const optUpdateOpId = text.optUpdateOpId
                let opId = ((await gsapi.spreadsheets.values.get(optUpdateOpId)).data.values).flat()
                const optUpdate = {
                    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                    range: "salesDepartment!A2:A",
                    valueInputOption: "USER_ENTERED",
                    resource: {values: [[`${user_id}`]]}
                }
                if (opId.find(item => item === user_id)) {
                    await ctx.replyWithHTML("Юзер уже добавлен")
                } else {
                    gsapi.spreadsheets.values.append(optUpdate)
                    await ctx.replyWithHTML("Теперь юзер может пользоваться ботом 👍")
                }
                return ctx.scene.leave()
            } else {
                await ctx.reply("Отправьте через телефон контакт (с помощью скрепки слева 👇), которого хотите добавить")
            }
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const addOpScene = new WizardScene('addOpWizard', startStep, addContract)
module.exports = addOpScene