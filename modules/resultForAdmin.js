const { Composer, Scenes: { WizardScene }, Markup} = require('telegraf')
const text = require('./const')

const startStep = new Composer()
startStep.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            const keyboard = text.keyboard
            ctx.wizard.state.data = {}
            ctx.wizard.state.data.username = ctx.message.from.username
            ctx.wizard.state.data.firstname = ctx.message.from.first_name
            ctx.wizard.state.data.lastname = ctx.message.from.last_name
            await ctx.replyWithHTML("Дата от", keyboard)
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const beforeDate = new Composer()
beforeDate.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.beforeDate = ctx.message.text
            const dateString = ctx.wizard.state.data.beforeDate
            const date = new Date(dateString.split(".").reverse().join("-"))
            if (isNaN(date.getTime())) {
                await ctx.replyWithHTML("не верно ввели дату, начните заново")
                return ctx.scene.leave()
            } else {
                await ctx.replyWithHTML("Дата до")
                return ctx.wizard.next()
            }
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const savetDate = new Composer()
savetDate.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.afterDate = ctx.message.text
            const dateString = ctx.wizard.state.data.afterDate
            const date = new Date(dateString.split(".").reverse().join("-"))
            if (isNaN(date.getTime())) {
                await ctx.replyWithHTML("не верно ввели дату, начните заново")
                return ctx.scene.leave()
            } else {
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
                await ctx.replyWithHTML("Вы выбрали дату от <b>" + ctx.wizard.state.data.beforeDate + "</b> до <b>" + ctx.wizard.state.data.afterDate +
                    "</b>", Markup.inlineKeyboard([Markup.button.callback('показать результат', 'finalresult')]))
                return ctx.wizard.next()
            }
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const finalResult = new Composer()
finalResult.action("finalresult", async (ctx) => {
    try {
        await ctx.answerCbQuery()
        const gsapi = text.gsapi
        const keyboardMenu = text.keyboardMenu
        const optUpdateSum = text.optUpdateSum
        let sumFact = ((await gsapi.spreadsheets.values.get(optUpdateSum)).data.values)
        const optUpdateAccount = text.optUpdateAccount
        const findAccount = ((await gsapi.spreadsheets.values.get(optUpdateAccount)).data.values).flat()

        await ctx.replyWithHTML("Сумма из 'Общая сумма оплаты': <b>" + sumFact[0]+
                                    "</b>\nСреднее из 'Cредний чек': <b>" + sumFact[2]+
            "</b>\nСумма из 'Сумма в депозит обязательств': <b>" + sumFact[4]+
            "</b>\nСумма из 'Сумма этого месяца': <b>" + sumFact[6]+
            "</b>\nСумма факта: <b>" + sumFact[8] + "</b>")
        await ctx.replyWithHTML('------------------------------')
        await ctx.replyWithHTML("Деньги в 'Форте счет': <b>" + findAccount[0] +
            "</b>\nДеньги в 'Наличные': <b>" + findAccount[1]+
            "</b>\nДеньги в 'Каспи Азат': <b>" + findAccount[2]+
            "</b>\nДеньги в 'Каспи Алдияр': <b>" + findAccount[3]+
            "</b>\nДеньги в 'Доллары': <b>" + findAccount[4] + "</b>")
        await ctx.reply('------------------------------',keyboardMenu)
        return ctx.scene.leave()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const resultScene = new WizardScene('resultWizard', startStep, beforeDate, savetDate, finalResult)
module.exports = resultScene
