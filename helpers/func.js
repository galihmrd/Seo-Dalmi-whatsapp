const chalk = require('chalk')
const fetch = require('node-fetch')
const fs = require('fs')
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

async function download_media(messages, text, filename) {
    const m = messages[0]
    const messageType = Object.keys (m.message)[0]
    const buffer = await downloadMediaMessage(
        m,
        'buffer',
        { },
    )
    if (messageType === 'imageMessage') {
        return await writeFile(`./downloads/${filename}.jpeg`, buffer)
    } else if (messageType === 'audioMessage') {
        return await writeFile(`./downloads/${filename}.opus`, buffer)
    } else if (messageType === 'videoMessage') {
        return await writeFile(`./downloads/${filename}.mp4`, buffer)
    } else if (messageType === 'documentMessage') {
        if (!text.includes("mp4")) {
            if (text.endsWith("jpg")) {
                return await writeFile(`./downloads/${filename}.jpg`, buffer)
            } else if (text.endsWith("png")) {
                return await writeFile(`./downloads/${filename}.png`, buffer)
            } else if (text.endsWith("jpeg")) {
                return await writeFile(`./downloads/${filename}.jpeg`, buffer)
            } else if (text.endsWith("heic")) {
                return await writeFile(`./downloads/${filename}.heic`, buffer)
            }
        } else {
            return await writeFile(`./downloads/${filename}.mp4`, buffer)
        }
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

async function ocr_gpt(path, out) {
    const func = await python("../py_helper.py")
    const result = await func.ocrAI(path, out, setting.keyopenai)
    python.exit()
    return result
}

async function speech2text(filename) {
    const func = await python("../py_helper.py")
    const result = await func.speech2text(`downloads/${filename}.opus`, setting.keyopenai)
    python.exit()
    return result
}

async function download(url) {
    if (url.startsWith("@")) {
        const urlSong = url.split('@')[1].split('|')[0]
        const urlImg = url.split('|')[1]
        return await tiktok_image(urlImg, urlSong)
    } else {
        const func = await python("../py_helper.py")
        const result = await func.download_vid(url)
        python.exit()
        return result
    }
}

async function tiktok_image(imageUrl, songUrl) {
  const response = await fetch(imageUrl);
  const buffer = await response.buffer();
  writeFile(`./downloads/image.jpg`, buffer)
  return await download_sound(songUrl)
}

async function download_sound(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  writeFile(`./downloads/sound.mp3`, buffer)
  return await ffmpeg_vid()
}

async function ffmpeg_vid() {
    const func = await python("../py_helper.py")
    const result = await func.ffmpeg_vid()
    python.exit()
    return result
}

async function pushLogs(client, m) {
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(e => {}) : ''
    const groupName = m.isGroup ? groupMetadata.subject : ''
    const pushname = m.pushName || "No Name"
    var budy = (typeof m.text == 'string' ? m.text : '')
    let argsLog = (budy.length > 30) ? `${m.text.substring(0, 30)}...` : budy
    if (argsLog && !m.isGroup) {
        console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`))
        if (setting.pushTele) {
            await os_system(`curl -s -X POST https://api.telegram.org/bot${setting.teleToken}/sendMessage?chat_id=${setting.teleChatid} -d "disable_web_page_preview=true" -d "parse_mode=html&text=<b>From:</b> ${m.pushName} | wa.me/${m.sender.replace('@s.whatsapp.net', '')}\n<b>Message:</b> ${m.text}"`)
        }
    } else if (argsLog && m.isGroup) {
        console.log(chalk.black(chalk.bgWhite('[ LOGS ]')), color(argsLog, 'turquoise'), chalk.magenta('From'), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace('@s.whatsapp.net', '')} ]`), chalk.blueBright('IN'), chalk.green(groupName))
        if (setting.pushTele) {
            await os_system(`curl -s -X POST https://api.telegram.org/bot${setting.teleToken}/sendMessage?chat_id=${setting.teleChatid} -d "disable_web_page_preview=true" -d "parse_mode=html&text=<b>From:</b> ${m.pushName} | wa.me/${m.sender.replace('@s.whatsapp.net', '')} in ${groupName}\n<b>Message:</b> ${m.text}"`)
        }
    }
}


module.exports = { os_system, download_media, download, ask_ai, ocr_gpt, speech2text, pushLogs }
