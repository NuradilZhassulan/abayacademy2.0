const { Telegraf, Markup} = require('telegraf')
const { google } = require('googleapis')
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const CREDENTIALS = require('../credentials.json')
require('dotenv').config()


const BOT_TOKEN = process.env.BOT_TOKEN
const bot = new Telegraf(BOT_TOKEN)
const url = process.env.APP_URL

const dueDateText = "Выберите срок оплаты (месяц)"
const paymentAmountText = "Вид оплаты 🤑"
const newOrOldStudentText = "Школьник"
const adressText = "Выберите адрес"
const paymentReceivedText = "Куда поступила оплата 🏦"
const resultSumText = "Результат:"
const dueDateTextKBoard = Markup.inlineKeyboard([
    [Markup.button.callback('1', '1'), Markup.button.callback('3', '3'), Markup.button.callback('6', '6'),
        Markup.button.callback('9', '9'), Markup.button.callback('12', '12')]])
const paymentAmountTextKBoard = Markup.inlineKeyboard([
    [Markup.button.callback('Полная оплата', 'fullPayment'),
        Markup.button.callback('Предоплата', 'prepayment'),
        Markup.button.callback('Доплата', 'surcharge')]])
const adressTextKBoard = Markup.inlineKeyboard([
    [Markup.button.callback('Курмангазы 111', 'kurmangazy'), Markup.button.callback('Жетысу 3', 'zhetisu')],
    [Markup.button.callback('Онлайн', 'online'), Markup.button.callback('Туран 16', 'turan')],
    [Markup.button.callback('Мангилик ел 20', 'mangilikel'), Markup.button.callback('Отырар 4/3', 'otyrar')]
])
const paymentReceivedKBoard = Markup.inlineKeyboard([
    [Markup.button.callback('Форте счет', 'forte'),
     Markup.button.callback('Наличные', 'cash')],
    [Markup.button.callback('Каспи Азат', 'kaspiAzat'),
     Markup.button.callback('Каспи Алдияр', 'kaspiAldiyar')],
    [Markup.button.callback('Доллары', 'dollars')]
])
const resultSumKBoard = Markup.inlineKeyboard([
     [Markup.button.callback('Факта за период', 'sumFact')],
    [Markup.button.callback('Сколько денег в каждом счете', 'moneyAccount')]])
const newOrOldStudentKBoard = Markup.inlineKeyboard([
    [Markup.button.callback('Новый', 'new'),
    Markup.button.callback('Старый', 'old')]])

const client = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES,
    null
)

const gsapi = google.sheets({
    version: "v4",
    auth: client
})

//ФИО ученика
const optUpdate = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "Data!B2:B",
    valueRenderOption: "FORMATTED_VALUE"
}

//инфо строки
const optUpdateRow = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "Data!A2:Z",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма из общ оплаты
const optUpdateSum = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!A3:A11",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма из депозит обязательств
const optUpdateAmountDeposit = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!A7:B7",
    valueRenderOption: "FORMATTED_VALUE"
}

//Среднее из среднего чека
const optUpdateAverage = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!A5:B5",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма из сумма этого месяца
const optUpdatethisMonthSum = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!A11:B11",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма из счета форте
const optUpdateAccountForte = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!B9:B9",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма из счета наличные
const optUpdateAccountCash = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!C9:C9",
    valueRenderOption: "FORMATTED_VALUE"
}
//Сумма из счета каспи Азат
const optUpdateAccountKaspiAzat = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!D9:D9",
    valueRenderOption: "FORMATTED_VALUE"
}
//Сумма из счета каспи Алдияр
const optUpdateAccountKaspiAldiyar = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!E9:E9",
    valueRenderOption: "FORMATTED_VALUE"
}
//Сумма из счета доллары
const optUpdateAccountDollars = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!F9:F9",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма из счета
const optUpdateAccount = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!B9:F9",
    valueRenderOption: "FORMATTED_VALUE"
}

//Сумма факта за период
const optUpdatesumFact = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!A11:A11",
    valueRenderOption: "FORMATTED_VALUE"
}

//инициатор
const optUpdateInitiator = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!I3:I",
    valueRenderOption: "FORMATTED_VALUE"
}

//факт инициатора
const optUpdateInitiatorFact = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "SumAndAverage!H19:I19",
    valueRenderOption: "FORMATTED_VALUE"
}

//айдишки ОПшников
const optUpdateOpId = {
    spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
    range: "salesDepartment!A2:A",
    valueRenderOption: "FORMATTED_VALUE"
}

const keyboardClose = {
    reply_markup: {
        keyboard: [
            ['Отмена 🚫']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}

const keyboardMenu = {
    reply_markup: {
        keyboard: [
            ['Добавить ученика ✅', 'Ежемесячник 🔃'],
            ['Книга 📖', 'Общий результат 👀'],
            ['Добавить ОПшника ➕', 'Кикнуть ОПшника ➖'],
            ['Факт ОП 🤑', 'Отмена 🚫']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}

const keyboardMenuForUser = {
    reply_markup: {
        keyboard: [
            ['Добавить ученика ✅', 'Ежемесячник 🔃'],
            ['Книга 📖','Отмена 🚫']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
}

module.exports.bot = bot
module.exports.url = url
module.exports.BOT_TOKEN = BOT_TOKEN
module.exports.dueDateText = dueDateText
module.exports.paymentAmountText = paymentAmountText
module.exports.adressText = adressText
module.exports.paymentReceivedText = paymentReceivedText
module.exports.resultSumText = resultSumText
module.exports.newOrOldStudentText = newOrOldStudentText
module.exports.dueDateTextKBoard = dueDateTextKBoard
module.exports.paymentAmountTextKBoard = paymentAmountTextKBoard
module.exports.adressTextKBoard = adressTextKBoard
module.exports.paymentReceivedKBoard = paymentReceivedKBoard
module.exports.newOrOldStudentKBoard = newOrOldStudentKBoard
module.exports.resultSumKBoard = resultSumKBoard
module.exports.client = client
module.exports.gsapi = gsapi
module.exports.optUpdate = optUpdate
module.exports.optUpdateRow = optUpdateRow
module.exports.optUpdateSum = optUpdateSum
module.exports.optUpdateAverage = optUpdateAverage
module.exports.optUpdateAmountDeposit = optUpdateAmountDeposit
module.exports.optUpdateAccount = optUpdateAccount
module.exports.optUpdatethisMonthSum = optUpdatethisMonthSum
module.exports.optUpdatesumFact = optUpdatesumFact
module.exports.optUpdateAccountForte = optUpdateAccountForte
module.exports.optUpdateAccountCash = optUpdateAccountCash
module.exports.optUpdateAccountKaspiAzat = optUpdateAccountKaspiAzat
module.exports.optUpdateAccountKaspiAldiyar = optUpdateAccountKaspiAldiyar
module.exports.optUpdateAccountDollars = optUpdateAccountDollars
module.exports.optUpdateInitiator = optUpdateInitiator
module.exports.optUpdateInitiatorFact = optUpdateInitiatorFact
module.exports.optUpdateOpId = optUpdateOpId
module.exports.keyboardClose = keyboardClose
module.exports.keyboardMenu = keyboardMenu
module.exports.keyboardMenuForUser = keyboardMenuForUser



