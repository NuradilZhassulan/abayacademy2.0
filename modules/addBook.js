const { Composer, Scenes: { WizardScene }} = require('telegraf')
const moment = require('moment');
const text = require('./const')

let createDate
const startStep = new Composer()
startStep.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            const gsapi = text.gsapi
            const optUpdateOpId = text.optUpdateOpId
            let opId = ((await gsapi.spreadsheets.values.get(optUpdateOpId)).data.values).flat()
            if(opId.find(item => item === (ctx.chat.id).toString())) {
                ctx.wizard.state.data = {}
                createDate = new Date(1970, 0, 1)
                createDate.setSeconds(ctx.message.date)
                createDate = moment(createDate).utc().format('DD.MM.YYYY')
                ctx.wizard.state.data.username = ctx.message.from.username
                ctx.wizard.state.data.firstname = ctx.message.from.first_name
                ctx.wizard.state.data.lastname = ctx.message.from.last_name
                await ctx.replyWithHTML("Введите Фамилия Имя ученика 👶")
                return ctx.wizard.next()
            } else {
                await ctx.reply("обратитесь к администратору")
                return ctx.scene.leave()
            }
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const studentName = new Composer()
studentName.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.namestud = ctx.message.text
            await ctx.replyWithHTML("Введите класс, направление (РО/КО)")
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const studentClass = new Composer()
studentClass.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.classstud = ctx.message.text
            await ctx.replyWithHTML("Введите Фамилия Имя родителя 👨‍👩‍👦")
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

//ФИО родителя
const parentName = new Composer()
parentName.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.parentName = ctx.message.text
            await ctx.replyWithHTML("Введите сумму книги 💰")
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const paymentAmountSum = new Composer()
paymentAmountSum.hears(/^[0-9]+$/, async (ctx) => {
    try {
        ctx.wizard.state.data.paymentAmount = ctx.message.text
        await ctx.replyWithHTML(text.paymentReceivedText, text.paymentReceivedKBoard)
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})


const paymentReceived = new Composer()
paymentReceived.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            await ctx.replyWithHTML("Выберите из списка 👆")
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})
paymentReceived.on("callback_query", async (ctx) => {
    try {
        switch (ctx.update.callback_query.data) {
            case 'forte':
                ctx.wizard.state.data.paymentReceived = "Форте счет"
                break
            case 'cash':
                ctx.wizard.state.data.paymentReceived = "Наличные"
                break
            case 'kaspiAzat':
                ctx.wizard.state.data.paymentReceived = "Каспи Азат"
                break
            case 'kaspiAldiyar':
                ctx.wizard.state.data.paymentReceived = "Каспи Алдияр"
                break
            case 'dollars':
                ctx.wizard.state.data.paymentReceived = "Доллары"
                break
        }
        wizardDate = ctx.wizard.state.data
        const keyboardMenuForUser = text.keyboardMenuForUser
        const keyboardMenu = text.keyboardMenu

        const gsapi = text.gsapi
        const optUpdate = {
            spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
            range: "Book!A:H",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [
                        `${wizardDate.firstname + " " + wizardDate.lastname}`,
                        `${wizardDate.namestud}`, `${wizardDate.classstud}`,
                        `${wizardDate.parentName}`, `${wizardDate.paymentAmount}`, `${wizardDate.paymentReceived}`,
                        `${createDate}`
                    ]
                ]
            }
        };

        gsapi.spreadsheets.values.append(optUpdate)

        if(ctx.chat.id === 400336335 || ctx.chat.id === 256177977 || ctx.chat.id === 275028553) {
            await ctx.replyWithHTML(`\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`, keyboardMenu)
        } else {
            await ctx.replyWithHTML(`\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`, keyboardMenuForUser)
        }

        const bot = text.bot
        let id = -1001587919699;
        let message = `Инициатор: <b>${ctx.wizard.state.data.firstname} ${ctx.wizard.state.data.last_name ? ctx.wizard.state.data.last_name: ''}</b>\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`;
        let parse_mode = 'HTML';
        bot.telegram.sendMessage(id, message, { parse_mode })
        bot.telegram.sendSticker(ctx.chat.id, "CAACAgIAAxkBAAI2IGFhqBcmOyOwvGC5r7beIu_ZRr6mAAICAAOvxlEat-gMjnASweEhBA" )
        return ctx.scene.leave()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const addBookScene = new WizardScene('addBookWizard', startStep, studentName, studentClass, parentName, paymentAmountSum, paymentReceived)
module.exports = addBookScene