const { Composer, Scenes: { WizardScene }, Markup} = require('telegraf')
const text = require("./const");

const startStep = new Composer()
startStep.on("text", async (ctx) => {
    try {
        ctx.wizard.state.data = {}
        await ctx.replyWithHTML("дата от")
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const beforeDate = new Composer()
beforeDate.hears(/^[0-9.]+$/, async (ctx) => {
    try {
        ctx.wizard.state.data.beforeDate = ctx.message.text
        await ctx.replyWithHTML("дата до")
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const savetDate = new Composer()
let findOp
savetDate.hears(/^[0-9.]+$/, async (ctx) => {
    try {
        ctx.wizard.state.data.afterDate = ctx.message.text
        const gsapi = text.gsapi
        const optUpdate = {
            spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
            range: "SumAndAverage!A1:B1",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [
                        `${ctx.wizard.state.data.beforeDate}`, `${ctx.wizard.state.data.afterDate}`
                    ]
                ]
            }
        }
        gsapi.spreadsheets.values.update(optUpdate)

        const optUpdateInitiator = text.optUpdateInitiator
        findOp = ((await gsapi.spreadsheets.values.get(optUpdateInitiator)).data.values).flat()
        let opname
        for(let i = 0; i < findOp.length; i++) {
            opname = findOp[i].replace(/\s/g, '')
            await ctx.replyWithHTML("Продажник: <b>"+findOp[i]+"</b>",Markup.inlineKeyboard([Markup.button.callback(findOp[i], opname)]))
            await ctx.reply('------------------------------')
        }
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const nameOpshnik = new Composer()
nameOpshnik.on('callback_query', async (ctx) => {
    try {
        let checkNameOp = ((ctx.update.callback_query.message.reply_markup.inline_keyboard).flat())[0]
        ctx.wizard.state.data.nameOp = checkNameOp.text
        const gsapi = text.gsapi
        const optUpdate = {
            spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
            range: "SumAndAverage!D1:D1",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [
                        `${ctx.wizard.state.data.nameOp}`
                    ]
                ]
            }
        }
        gsapi.spreadsheets.values.update(optUpdate)
        await ctx.replyWithHTML("==================\nВы выбрали дату\nот <b>" + ctx.wizard.state.data.beforeDate + "</b> до <b>" + ctx.wizard.state.data.afterDate +
            "</b>\n==================", Markup.inlineKeyboard([Markup.button.callback('показать результат', 'finalresult')]))
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const finalResult = new Composer()
finalResult.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            await ctx.replyWithHTML("Выберите из списка 👆")
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})
finalResult.action("finalresult", async (ctx) => {
    try {
        await ctx.answerCbQuery()
        const gsapi = text.gsapi
        const optUpdateInitiatorFact = text.optUpdateInitiatorFact
        let factOp = (await gsapi.spreadsheets.values.get(optUpdateInitiatorFact)).data.values
        await ctx.replyWithHTML("Факт ОП: <b>"+ factOp+"</b>")
        return ctx.scene.leave()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const factOPScene = new WizardScene('factOPWizard', startStep, beforeDate, savetDate, nameOpshnik, finalResult)
module.exports = factOPScene