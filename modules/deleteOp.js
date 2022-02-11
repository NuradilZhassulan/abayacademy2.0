const { Composer, Scenes: { WizardScene }} = require('telegraf')
const text = require("./const");

const startStep = new Composer()
startStep.on("text", async (ctx) => {
    try {
        ctx.wizard.state.data = {}
        await ctx.replyWithHTML("Отправь контакт 👇")
        return ctx.wizard.next()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const deleteContract = new Composer()
deleteContract.use(async (ctx) => {
    try {
        let user_id = (ctx.update.message.contact.user_id).toString()
        const gsapi = text.gsapi
        const optUpdateOpId = text.optUpdateOpId
        let opId = ((await gsapi.spreadsheets.values.get(optUpdateOpId)).data.values).flat()
        const po = opId.findIndex(item => item === user_id)
        const poRange =  po+2
        const batchUpdateRequest = {
            "requests": [
                {
                    "deleteDimension": {
                        "range": {
                            "sheetId": 1027644001,
                            "dimension": "COLUMNS",
                            "startIndex": 1,
                            "endIndex": 1

                        }
                    }
                },
                {
                    "deleteDimension": {
                        "range": {
                            "sheetId": 1027644001,
                            "dimension": "ROWS",
                            "startIndex": poRange-1,
                            "endIndex": poRange

                        }
                    }
                }
            ]
        }
        if(opId.find(item => item === user_id)) {
            gsapi.spreadsheets.batchUpdate({
                spreadsheetId: "1ibaUK-Ebm12RhisI9Ohz-t5BAx8BT7dX1U_TJDTBQB4",
                resource: batchUpdateRequest
            })
            await ctx.replyWithHTML("Удалил ✅")
        } else {
            await ctx.replyWithHTML("Его нет в списках ОП 🤷‍♂️")
        }
        return ctx.scene.leave()
    } catch (e) {
        await ctx.reply("что то пошло не так, обратитесь к разработчику")
        console.error(e)
        return ctx.scene.leave()
    }
})

const deleteOpScene = new WizardScene('deleteOpWizard', startStep, deleteContract)
module.exports = deleteOpScene