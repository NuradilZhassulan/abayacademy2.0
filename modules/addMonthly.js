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
                await ctx.replyWithHTML(text.newOrOldStudentText, text.newOrOldStudentKBoard)
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

let oldStudent
let newStudent
const newOrOldStudentText = new Composer()
newOrOldStudentText.on("text", async (ctx) => {
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
newOrOldStudentText.on('callback_query', async (ctx) => {
    try {
        switch (ctx.update.callback_query.data) {
            case 'new':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.paymentAmountText = "Новый"
                oldStudent = false
                newStudent = true
                break
            case 'old':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.paymentAmountText = "Старый"
                oldStudent = true
                newStudent = false
                break
        }
        await ctx.replyWithHTML("Введите Фамилия Имя ученика 👶")
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})


let indexNameStud = 0
let studName
let indices = []
//ФИО ученика
const studentName = new Composer()
studentName.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.namestud = ctx.message.text
            studName = ctx.wizard.state.data.namestud
            if (oldStudent === true) {
                // const nameStud = studName

                const gsapi = text.gsapi
                const optUpdate = text.optUpdate

                const findNameStud = (await gsapi.spreadsheets.values.get(optUpdate)).data.values;
                const ress = findNameStud.flat()

                // const lowercasednameStud = nameStud.toLowerCase()
                // const lowercased = ress.map(ctx => ctx.toLowerCase())



                let idx = ress.indexOf(studName)
                while (idx !== -1) {
                    indices.push(idx);
                    idx = ress.indexOf(studName, idx + 1);
                }
                indexNameStud = indices[indices.length - 1]


                let findStudName = false
                if (indexNameStud !== undefined) {findStudName = true}

                if (findStudName === true) {
                    await ctx.replyWithHTML("Введите сумму")
                    return ctx.wizard.selectStep(ctx.wizard.cursor + 8)
                } else {
                    await ctx.replyWithHTML("Не верно ввели фамилия имя ученика, найдите в чате 'Продажи' и напишите правильно")
                    return ctx.wizard.selectStep(ctx.wizard.cursor + 7)
                }

            } else {
                await ctx.replyWithHTML("Введите класс, направление (РО/КО)")
                return ctx.wizard.next()
            }
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
            await ctx.replyWithHTML("Введите сумму 💰")
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const paymentAmount = new Composer()
paymentAmount.hears(/^[0-9]+$/, async (ctx) => {
    try {
        ctx.wizard.state.data.paymentAmount = ctx.message.text
        if (45000 <= ctx.wizard.state.data.paymentAmount && ctx.wizard.state.data.paymentAmount <= 59000) {
            await ctx.replyWithHTML(text.paymentReceivedText, text.paymentReceivedKBoard)
            return ctx.wizard.next()
        } else {
            await ctx.replyWithHTML("Ввели некорректную сумму договора, обратитесь к администратору, после начните заново\n /start")
            return ctx.scene.leave()
        }
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
        await ctx.replyWithHTML('Введите дату начало обучения в формате:\n <b>DD.MM.YYYY (день.месяц.год)</b>\n <i>31.12.2020</i>')
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const startLearning = new Composer()
startLearning.hears(/^[0-9.]+$/, async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.startLearning = ctx.message.text
            await ctx.replyWithHTML(text.adressText, text.adressTextKBoard)
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

let wizardDate
const conditionStep = new Composer()
conditionStep.on("callback_query", async (ctx) => {
    try {
        switch (ctx.update.callback_query.data) {
            case 'kurmangazy':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.address = "Курмангазы 111"
                break
            case 'zhetisu':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.address = "Жетысу 3"
                break
            case 'online':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.address = "Онлайн"
                break
            case 'turan':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.address = "Туран 16"
                break
            case 'mangilikel':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.address = "Мангилик ел 20"
                break
            case 'otyrar':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.address = "Отырар 4/3"
                break
        }
        wizardDate = ctx.wizard.state.data
        const keyboardMenuForUser = text.keyboardMenuForUser
        const keyboardMenu = text.keyboardMenu

        /* Срок оплаты */
        let dueDate = 1
        /* Срок оплаты */

        /* Сумма оплаты */
        let paid = 0
        /* Сумма оплаты */

        /* Средний чек */
        let averageCheck
        averageCheck = parseInt(wizardDate.paymentAmount)
        /* Средний чек */

        /* Сумма в депозит обязательств */
        const amountDeposit = 0
        /* Сумма в депозит обязательств */

        /* Если есть долг */
        let duty = 0
        /* Если есть долг */

        /* Срок действия оплаты  */
        const date = wizardDate.startLearning;
        const newd = new Date(date.split(".").reverse().join("."));
        const dd = newd.getDate();
        const mm = newd.getMonth()+1;
        const yy = newd.getFullYear();
        const parsedate = yy+"."+mm+"."+dd;

        const startLearningDate = new Date(parsedate)
        const D = new Date(startLearningDate);
        D.setMonth(D.getMonth() + dueDate);

        const paymentValidity = moment(D).utc().format('DD.MM.YYYY')
        /* Срок действия оплаты */

        const gsapi = text.gsapi
        const optUpdate = {
            spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
            range: "Data!A:X",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    [
                        `${wizardDate.firstname + " " + wizardDate.lastname}`,
                        `${wizardDate.namestud}`, `${wizardDate.classstud}`,
                        `${wizardDate.parentName}`, `${wizardDate.paymentAmount}`, `${paid}`,
                        `0`, ``, `0`,``, `0`, ``, `0`, ``,
                        `Ежемесячник`,
                        `${duty}`, `${dueDate}`, `${averageCheck}`, `${wizardDate.startLearning}`,
                        `${paymentValidity}`, `${averageCheck}`, `${amountDeposit}`, `${wizardDate.paymentReceived}`,
                        `${wizardDate.address}`, `${createDate}`
                    ]
                ]
            }
        };

        gsapi.spreadsheets.values.append(optUpdate)

        let money = wizardDate.paymentAmount

        if(ctx.chat.id === 400336335 || ctx.chat.id === 256177977 || ctx.chat.id === 275028553) {
            await ctx.replyWithHTML(`\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`, keyboardMenu)
        } else {
            await ctx.replyWithHTML(`\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`, keyboardMenuForUser)
        }

        const bot = text.bot
        let id = -1001587919699;
        let message = `Инициатор: <b>${ctx.wizard.state.data.firstname} ${ctx.wizard.state.data.last_name ? ctx.wizard.state.data.last_name: ''}</b>\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма договора: <b>${wizardDate.paymentAmount}</b>\nСумма оплаты: <b>${money}</b> <i>${wizardDate.paymentAmountText}</i>\nСрок оплаты: <b>${dueDate} (месяцев)</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>\nАдрес: <b>${wizardDate.address}</b>\n`;
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

//ФИО ученика
const studentNameRepeat = new Composer()
studentNameRepeat.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            studName = ctx.message.text
            const nameStud = studName

            const gsapi = text.gsapi
            const optUpdate = text.optUpdate

            const findNameStud = (await gsapi.spreadsheets.values.get(optUpdate)).data.values;
            const ress = findNameStud.flat()
            const lowercasednameStud = nameStud.toLowerCase()
            const lowercased = ress.map(ctx => ctx.toLowerCase())

            /* последняя внесенная оплата */
            let indices = [];
            let idx = lowercased.indexOf(lowercasednameStud);
            while (idx !== -1) {
                indices.push(idx);
                idx = lowercased.indexOf(lowercasednameStud, idx + 1);
            }
            indexNameStud = indices[indices.length - 1]
            /* последняя внесенная оплата */

            let findStudName = false
            if (indexNameStud !== undefined) {
                findStudName = true
            }

            if (findStudName === true) {
                await ctx.replyWithHTML("Введите сумму")
                return ctx.wizard.next()
            } else {
                await ctx.replyWithHTML("Обратно не правильно ввели фамилия имя ученика, обратитесь к администратору для добавление Вас в чат 'Продажи'\nДалее найдите там как правильно заполнено поле 'ФИО школьника' и после начните заново\n /start")
                return ctx.scene.leave()
            }
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

let findDuty = 0
let findPrepay = 0
const oldStudentStep = new Composer()
oldStudentStep.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.prepayment = ctx.message.text

            wizardDate = ctx.wizard.state.data
            let duty = 0

            const gsapi = text.gsapi
            const optUpdateRow = text.optUpdateRow
            const findRow = (await gsapi.spreadsheets.values.get(optUpdateRow)).data.values[indexNameStud];

            findDuty = findRow[15]
            findPrepay = findRow[5]

            let dueDate = 1

            const date = findRow[19];
            const newd = new Date(date.split(".").reverse().join("."));
            const dd = newd.getDate();
            const mm = newd.getMonth()+1;
            const yy = newd.getFullYear();
            const parsedate = yy+"."+mm+"."+dd;

            const startLearningDate = new Date(parsedate)
            const D = new Date(startLearningDate);
            D.setMonth(D.getMonth() + dueDate);

            const paymentValidity = moment(D).utc().format('DD.MM.YYYY')

            let rangestr = "Data!A:Z"
            const optUpdate = {
                spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                range: rangestr,
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [
                        [
                            `${wizardDate.firstname + " " + wizardDate.lastname}`,
                            `${studName}`, `${findRow[2]}`, `${findRow[3]}`, `${findRow[4]}`, `${findPrepay}`,
                            `0`, ``, `0`, ``, `0`, ``, `0`, ``,
                            `Ежемесячник`, `${duty}`, `${findRow[16]}`, `${findRow[17]}`, `${findRow[18]}`,
                            `${paymentValidity}`, `${findRow[17]}`, `${findRow[21]}`, `${findRow[22]}`,
                            `${findRow[23]}`, `${findRow[24]}`, `${createDate}`
                        ]
                    ]
                }
            }

            gsapi.spreadsheets.values.append(optUpdate)

            await ctx.replyWithHTML(`ФИО школьника: <b>${studName}</b>\nКласс, направление: <b>${findRow[2]}</b>\nФИО родителя: <b>${findRow[3]}</b>\nСумма договора: <b>${findRow[4]}</b>\nСумма оплаты: <b>${wizardDate.prepayment}</b> <i>${wizardDate.paymentAmountText}</i>\nСрок оплаты: <b>${findRow[16]} (месяцев)</b>\nКуда поступила оплата: <b>${findRow[22]}</b>\nАдрес: <b>${findRow[23]}</b>\n`)
            const bot = text.bot
            let id = -1001587919699
            let message = `Инициатор: <b>${ctx.wizard.state.data.firstname} ${ctx.wizard.state.data.last_name ? ctx.wizard.state.data.last_name: ''}</b>\nФИО школьника: <b>${studName}</b>\nКласс, направление: <b>${findRow[2]}</b>\nФИО родителя: <b>${findRow[3]}</b>\nСумма договора: <b>${findRow[4]}</b>\nСумма оплаты: <b>${wizardDate.prepayment}</b> <i>ежемесячник</i>\nСрок оплаты: <b>${findRow[16]} (месяцев)</b>\nКуда поступила оплата: <b>${findRow[22]}</b>\nАдрес: <b>${findRow[23]}</b>\n`
            let parse_mode = 'HTML'
            bot.telegram.sendMessage(id, message, {parse_mode});
            bot.telegram.sendSticker(ctx.chat.id, "CAACAgIAAxkBAAI2IGFhqBcmOyOwvGC5r7beIu_ZRr6mAAICAAOvxlEat-gMjnASweEhBA")
            return ctx.scene.leave()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const addMonthlyScene = new WizardScene('addMonthlyWizard', startStep, newOrOldStudentText, studentName, studentClass, parentName, paymentAmount, paymentReceived, startLearning, conditionStep, studentNameRepeat, oldStudentStep)
module.exports = addMonthlyScene