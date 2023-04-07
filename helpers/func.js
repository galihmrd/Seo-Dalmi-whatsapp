const chalk = require('chalk')
const { python } = require("pythonia")
const { exec } = require("child_process");
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const { writeFile } = require('fs/promises')
const { Configuration, OpenAIApi } = require("openai")

const setting = require('../key.json')
const color = (text, color) => {
            return !color ? chalk.green(text) : chalk.keyword(color)(text)
        }


async function os_system(prompt) {
    exec(prompt, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
})};

async function download_media(messages, filename) {
      const m = messages[0]
//          if (!m.message) return
      const messageType = Object.keys (m.message)[0]
      console.log(messageType)
      if (messageType === 'imageMessage') {
          const buffer = await downloadMediaMessage(
              m,
              'buffer',
              { },
          )
          return await writeFile(`./downloads/${filename}.jpeg`, buffer)
      } else if (messageType === 'audioMessage') {
          const buffer = await downloadMediaMessage(
              m,
              'buffer',
              { },
          )
          return await writeFile(`./downloads/${filename}.opus`, buffer)
      }
}

async function ask_ai(text) {
    const configuration = new Configuration({
        apiKey: setting.keyopenai,
    });
    try {
        const openai = new OpenAIApi(configuration);
        const response = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [{role: "user", content: text}],
        });
        return response.data.choices[0].message.content
    } catch {
        return "AI Error!"
    }
}

async function ocr_gpt(path, out){
    const func = await python("../database.py")
    const result = await func.ocrAI(path, out, setting.keyopenai)
    python.exit()
    return result
}

async function speech2text(filename){
    const func = await python("../database.py")
    const result = await func.speech2text(`downloads/${filename}.opus`, setting.keyopenai)
    python.exit()
    return result
}

async function pushLogs(client, m) {
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(e => {}) : ''
    const groupName = m.isGroup ? groupMetadata.subject : ''
    const pushname = m.pushName || "No Name"
    var budy = (typeof m.text == 'string' ? m.text : '')
    let argsLog = (budy.length > 30) ? `${q.substring(0, 30)}...` : budy
    if (argsLog && !m.isGroup) {
        console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`))
    } else if (argsLog && m.isGroup) {
        console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`), chalk.blueBright('IN'), chalk.green(groupName))
    }
}


module.exports = { os_system, download_media, ask_ai, ocr_gpt, speech2text, pushLogs }
