const { Composer, Scenes: { WizardScene }} = require('telegraf')
const moment = require('moment');
const text = require('./const')

//полная сумма
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
                await ctx.replyWithHTML(text.paymentAmountText, text.paymentAmountTextKBoard)
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

let truePrepayment
let trueSurcharge
const paymentAmountText = new Composer()
paymentAmountText.on("text", async (ctx) => {
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
paymentAmountText.on('callback_query', async (ctx) => {
    try {
        switch (ctx.update.callback_query.data) {
            case 'fullPayment':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.paymentAmountText = "Полная оплата"
                trueSurcharge = false
                truePrepayment = false
                break
            case 'prepayment':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.paymentAmountText = "Предоплата"
                truePrepayment = true
                trueSurcharge = false
                break
            case 'surcharge':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.paymentAmountText = "Доплата"
                trueSurcharge = true
                truePrepayment = false
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
            if (trueSurcharge === true) {

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
                    await ctx.replyWithHTML("Введите сумму доплаты")
                    return ctx.wizard.selectStep(ctx.wizard.cursor + 10)
                } else {
                    await ctx.replyWithHTML("Не верно ввели фамилия имя ученика, найдите в чате 'Продажи' и напишите правильно")
                    return ctx.wizard.selectStep(ctx.wizard.cursor + 9)
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

//класс
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
            await ctx.replyWithHTML("Введите сумму договора 💰")
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

            // (45000 <= ctx.wizard.state.data.paymentAmount && ctx.wizard.state.data.paymentAmount <= 59000) ||
            // (120000 <= ctx.wizard.state.data.paymentAmount && ctx.wizard.state.data.paymentAmount <= 165000) ||
            // (240000 <= ctx.wizard.state.data.paymentAmount && ctx.wizard.state.data.paymentAmount <= 310000) ||
            // (340000 <= ctx.wizard.state.data.paymentAmount && ctx.wizard.state.data.paymentAmount <= 405000) ||
            // (440000 <= ctx.wizard.state.data.paymentAmount && ctx.wizard.state.data.paymentAmount <= 510000))

            if (truePrepayment === true) {
                await ctx.replyWithHTML("Введите сумму предоплаты")
                return ctx.wizard.next()
            } else {
                await ctx.replyWithHTML(text.paymentReceivedText, text.paymentReceivedKBoard)
                return ctx.wizard.selectStep(ctx.wizard.cursor + 2)
            }
        // } else {
        //     await ctx.replyWithHTML("Ввели некорректную сумму договора, обратитесь к администратору, после начните заново\n /start")
        //     return ctx.scene.leave()
        // }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const prepaymentSum = new Composer()
prepaymentSum.hears(/^[0-9]+$/, async (ctx) => {
    try {
        ctx.wizard.state.data.prepayment = ctx.message.text
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
            await ctx.replyWithHTML(text.dueDateText, text.dueDateTextKBoard)
            return ctx.wizard.next()
        }
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к администратору")
        console.error(e)
        return ctx.scene.leave()
    }
})

const dueDate = new Composer()
dueDate.on("callback_query",async (ctx) => {
    try {
        switch (ctx.update.callback_query.data) {
            case '1':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.dueDate = "1"
                break
            case '3':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.dueDate = "3"
                break
            case '6':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.dueDate = "6"
                break
            case '9':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.dueDate = "9"
                break
            case '12':
                await ctx.answerCbQuery()
                ctx.wizard.state.data.dueDate = "12"
                break
        }
        await ctx.replyWithHTML(text.adressText, text.adressTextKBoard)
        return ctx.wizard.next()
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
        // let dueDate
        // let paymentAmountInt = parseInt(wizardDate.paymentAmount)
        // if(45000 <= paymentAmountInt && paymentAmountInt <= 59000) {
        //     dueDate = 1
        // } else if (120000 <= paymentAmountInt && paymentAmountInt <= 165000) {
        //     dueDate = 3
        // } else if (240000 <= paymentAmountInt && paymentAmountInt <= 310000) {
        //     dueDate = 6
        // } else if (340000 <= paymentAmountInt && paymentAmountInt <= 405000) {
        //     dueDate = 9
        // } else if (440000 <= paymentAmountInt && paymentAmountInt <= 510000) {
        //     dueDate = 12
        // }
        /* Срок оплаты */

        /* Сумма оплаты */
        let paid
        if(wizardDate.paymentAmountText === "Предоплата") {
            paid = wizardDate.prepayment
        } else {
            paid = 0
        }
        /* Сумма оплаты */

        /* Средний чек */
        let averageCheck
        averageCheck = parseInt(wizardDate.paymentAmount) / parseInt(wizardDate.dueDate)
        averageCheck = parseInt(averageCheck)
        /* Средний чек */

        /* Сумма в депозит обязательств */
        const amountDeposit = parseInt(wizardDate.paymentAmount) - averageCheck
        /* Сумма в депозит обязательств */

        /* Если есть долг */
        let duty
        if(wizardDate.paymentAmountText === "Предоплата") {
            duty = parseInt(wizardDate.paymentAmount) - parseInt(wizardDate.prepayment)
        } else {
            duty = 0
        }

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
        D.setMonth(D.getMonth() + parseInt(wizardDate.dueDate));

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
                        `${wizardDate.paymentAmountText}`,
                        `${duty}`, `${wizardDate.dueDate}`, `${averageCheck}`, `${wizardDate.startLearning}`,
                        `${paymentValidity}`, `${averageCheck}`, `${amountDeposit}`, `${wizardDate.paymentReceived}`,
                        `${wizardDate.address}`, `${createDate}`
                    ]
                ]
            }
        };

        gsapi.spreadsheets.values.append(optUpdate)

        let money
        if(wizardDate.paymentAmountText === "Предоплата" || wizardDate.paymentAmountText === "Доплата") {
            money = wizardDate.prepayment
        } else {
            money = wizardDate.paymentAmount
        }

        if(ctx.chat.id === 400336335 || ctx.chat.id === 256177977 || ctx.chat.id === 275028553) {
            await ctx.replyWithHTML(`\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`, keyboardMenu)
        } else {
            await ctx.replyWithHTML(`\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма оплаты: <b>${wizardDate.paymentAmount}</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>`, keyboardMenuForUser)
        }

        const bot = text.bot
        let id = -1001587919699;
        let message = `Инициатор: <b>${ctx.wizard.state.data.firstname} ${ctx.wizard.state.data.last_name ? ctx.wizard.state.data.last_name: ''}</b>\nФИО школьника: <b>${wizardDate.namestud}</b>\nКласс, направление: <b>${wizardDate.classstud}</b>\nФИО родителя: <b>${wizardDate.parentName}</b>\nСумма договора: <b>${wizardDate.paymentAmount}</b>\nСумма оплаты: <b>${money}</b> <i>${wizardDate.paymentAmountText}</i>\nСрок оплаты: <b>${wizardDate.dueDate} (месяцев)</b>\nКуда поступила оплата: <b>${wizardDate.paymentReceived}</b>\nАдрес: <b>${wizardDate.address}</b>\n`;
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
                await ctx.replyWithHTML("Введите сумму доплаты")
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
const surchargeSum = new Composer()
surchargeSum.on("text", async (ctx) => {
    try {
        if(ctx.message.text === 'Отмена 🚫') {
            await ctx.replyWithHTML("пока")
            return ctx.scene.leave()
        } else {
            ctx.wizard.state.data.prepayment = ctx.message.text

            wizardDate = ctx.wizard.state.data

            const gsapi = text.gsapi
            const optUpdateRow = text.optUpdateRow
            const findRow = (await gsapi.spreadsheets.values.get(optUpdateRow)).data.values[indexNameStud];

            findDuty = findRow[15]
            findPrepay = findRow[5]

            let arr = [findRow[6], findRow[8], findRow[10], findRow[12]]
            let itemIndex
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === '0') {
                    itemIndex = i
                    break;
                } else {
                    itemIndex = "not found"
                }
            }

            let oneTransh = findRow[6]
            let dateOneTransh = findRow[7]
            let twoTransh = findRow[8]
            let dateTwoTransh = findRow[9]
            let threeTransh = findRow[10]
            let dateThreeTransh = findRow[11]
            let fourTransh = findRow[12]
            let dateFourTransh = findRow[13]
            let dateBefore
            if (itemIndex === 0) {
                oneTransh = wizardDate.prepayment
                dateOneTransh = createDate
                dateBefore = findRow[24]
            } else if (itemIndex === 1) {
                twoTransh = wizardDate.prepayment
                dateTwoTransh = createDate
                dateBefore = findRow[7]
            } else if (itemIndex === 2) {
                threeTransh = wizardDate.prepayment
                dateThreeTransh = createDate
                dateBefore = findRow[9]
            } else {
                fourTransh = wizardDate.prepayment
                dateFourTransh = createDate
                dateBefore = findRow[11]
            }

            const beforeDate = new Date(dateBefore.split(".").reverse().join("."))
            const beforeDD = beforeDate.getDate()
            const beforeMM = beforeDate.getMonth() + 1
            const beforeYY = beforeDate.getFullYear()
            const parseBeforeDate = beforeYY + "." + beforeMM + "." + beforeDD
            const newBeforeDate = new Date(parseBeforeDate)
            const monthBeforeDate = new Date(newBeforeDate)
            monthBeforeDate.getMonth()

            const dateCreate = new Date(createDate.split(".").reverse().join("."))
            const currDD = dateCreate.getDate()
            const currMM = dateCreate.getMonth() + 1
            const currYY = dateCreate.getFullYear()
            const parseCurrDate = currYY + "." + currMM + "." + currDD
            const newDateCreate = new Date(parseCurrDate)
            const monthDateCreate = new Date(newDateCreate)
            monthDateCreate.getMonth()

            let jointPrepayment
            jointPrepayment = parseInt(findPrepay) + parseInt(oneTransh) + parseInt(twoTransh) + parseInt(threeTransh)+ parseInt(fourTransh)
            const duty = parseInt(findRow[4]) - parseInt(jointPrepayment)

            let rangestr = "Data!A:Z"
            const optUpdate = {
                spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                range: rangestr,
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [
                        [
                            `${wizardDate.firstname + " " + wizardDate.lastname}`,
                            `${studName}`, `${findRow[2]}`, `${findRow[3]}`, `${findRow[4]}`, `${findPrepay}`, `${oneTransh}`,
                            `${dateOneTransh}`, `${twoTransh}`, `${dateTwoTransh}`, `${threeTransh}`, `${dateThreeTransh}`,
                            `${fourTransh}`, `${dateFourTransh}`,
                            `${wizardDate.paymentAmountText}`, `${duty}`, `${findRow[16]}`, `${findRow[17]}`, `${findRow[18]}`,
                            `${findRow[19]}`, `${findRow[17]}`, `${findRow[21]}`, `${findRow[22]}`,
                            `${findRow[23]}`, `${findRow[24]}`, `${createDate}`
                        ]
                    ]
                }
            }

            if (monthDateCreate.getMonth() === monthBeforeDate.getMonth()) {
                gsapi.spreadsheets.values.append(optUpdate);

                indices.forEach(function (item) {
                    let itemUpdate = item + 2
                    const UpdateRowDuty = {
                        spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                        range: "Data!E" + itemUpdate + ":W" + itemUpdate,
                        valueInputOption: "USER_ENTERED",
                        resource: {
                            values: [
                                ['', '', '', '', '', '',
                                    '', '', '', '',  `${findRow[14]}`, `${duty}`, `${findRow[16]}`, '',
                                    `${findRow[18]}`, `${findRow[19]}`, '', '']
                            ]
                        }
                    }
                    gsapi.spreadsheets.values.update(UpdateRowDuty)
                })

            } else {
                const optUpdate = {
                    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                    range: rangestr,
                    valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [
                            [
                                `${wizardDate.firstname + " " + wizardDate.lastname}`,
                                `${studName}`, `${findRow[2]}`, `${findRow[3]}`, `${findRow[4]}`, `${findPrepay}`, `${oneTransh}`,
                                `${dateOneTransh}`, `${twoTransh}`, `${dateTwoTransh}`, `${threeTransh}`, `${dateThreeTransh}`,
                                `${fourTransh}`, `${dateFourTransh}`,
                                `${wizardDate.paymentAmountText}`, `${duty}`, `${findRow[16]}`, `${findRow[17]}`, `${findRow[18]}`,
                                `${findRow[19]}`, '', '', `${findRow[22]}`,
                                `${findRow[23]}`, `${findRow[24]}`, `${createDate}`
                            ]
                        ]
                    }
                }

                gsapi.spreadsheets.values.append(optUpdate)

                indices.forEach(function (item) {
                    let itemUpdate = item + 2
                    const UpdateRowDuty = {
                        spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                        range: "Data!P" + itemUpdate + ":P" + itemUpdate,
                        valueInputOption: "USER_ENTERED",
                        resource: {
                            values: [
                                [`${duty}`]
                            ]
                        }
                    }
                    gsapi.spreadsheets.values.update(UpdateRowDuty)
                })

            }

            const keyboardMenuForUser = text.keyboardMenuForUser
            const keyboardMenu = text.keyboardMenu

            await ctx.replyWithHTML(`Остаток долга: <b>${duty}</b>`)
            if(ctx.chat.id === 400336335 || ctx.chat.id === 256177977 || ctx.chat.id === 275028553) {
                await ctx.replyWithHTML(`ФИО школьника: <b>${studName}</b>\nКласс, направление: <b>${findRow[2]}</b>\nФИО родителя: <b>${findRow[3]}</b>\nСумма договора: <b>${findRow[4]}</b>\nСумма оплаты: <b>${wizardDate.prepayment}</b> <i>${wizardDate.paymentAmountText}</i>\nСрок оплаты: <b>${findRow[16]} (месяцев)</b>\nКуда поступила оплата: <b>${findRow[22]}</b>\nАдрес: <b>${findRow[23]}</b>\n`, keyboardMenu)
            } else {
                await ctx.replyWithHTML(`ФИО школьника: <b>${studName}</b>\nКласс, направление: <b>${findRow[2]}</b>\nФИО родителя: <b>${findRow[3]}</b>\nСумма договора: <b>${findRow[4]}</b>\nСумма оплаты: <b>${wizardDate.prepayment}</b> <i>${wizardDate.paymentAmountText}</i>\nСрок оплаты: <b>${findRow[16]} (месяцев)</b>\nКуда поступила оплата: <b>${findRow[22]}</b>\nАдрес: <b>${findRow[23]}</b>\n`, keyboardMenuForUser)
            }

            const bot = text.bot
            let id = -1001587919699;
            let message = `Инициатор: <b>${ctx.wizard.state.data.firstname} ${ctx.wizard.state.data.last_name ? ctx.wizard.state.data.last_name: ''}</b>\nФИО школьника: <b>${studName}</b>\nКласс, направление: <b>${findRow[2]}</b>\nФИО родителя: <b>${findRow[3]}</b>\nСумма договора: <b>${findRow[4]}</b>\nСумма оплаты: <b>${wizardDate.prepayment}</b> <i>${wizardDate.paymentAmountText}</i>\nСрок оплаты: <b>${findRow[16]} (месяцев)</b>\nКуда поступила оплата: <b>${findRow[22]}</b>\nАдрес: <b>${findRow[23]}</b>\n`
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

const studentsScene = new WizardScene('StudentWizard', startStep, paymentAmountText, studentName, studentClass, parentName,paymentAmount,
    prepaymentSum, paymentReceived, startLearning, dueDate, conditionStep, studentNameRepeat, surchargeSum)
module.exports = studentsScene