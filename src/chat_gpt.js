const { ask_ai, download_media, os_system, ocr_gpt, speech2text } = require('../helpers/func')

module.exports = sansekai = async (client, m, chatUpdate, store) => {
    let number = m.sender.replace('@s.whatsapp.net', '')
    const mType = Object.keys (chatUpdate.messages[0].message)[0]
    if (m.text) {
        try {
            const res = await ask_ai(m.text)
            m.reply(res)
        } catch(err) {
            m.reply("Error!")
        }
    } else if (mType === 'imageMessage') {
        try {
            await download_media(chatUpdate.messages, number)
            const result = await ocr_gpt(`{number}.jpeg`, number)
            m.reply(result)
            await os_system(`rm -rf downloads/${number}.jpeg`)
        } catch {
            m.reply("Error!")
        }
    } else if (mType === 'audioMessage') {
        try {
            await download_media(chatUpdate.messages, number)
            const result = await speech2text(number)
            m.reply(result)
            await os_system(`rm -rf downloads/${number}.opus && rm -rf downloads/${number}.wav`)
        } catch {
            m.reply("Error!")
        }
    }
}
