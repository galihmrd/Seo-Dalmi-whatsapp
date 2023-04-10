const fs = require('fs')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const { download, pushLogs, os_system, download_media, ask_ai, ocr_gpt, speech2text } = require('../helpers/func')

const setting = require('../key.json')
const domain = ['vt.tiktok.com', 'app-va.tiktokv.com', 'vm.tiktok.com',
                'm.tiktok.com', 'tiktok.com', 'www.tiktok.com',
                'link.e.tiktok.com', 'us.tiktok.com','vt.tiktok.com',
                'app-va.tiktokv.com', 'm.tiktok.com', 'm.tiktok.com',
                'tiktok.com', 'www.tiktok.com', 'link.e.tiktok.com',
                'us.tiktok.com', 'fb.watch', 'www.facebook.com',  'fb.me', 'www.youtube.com', 'youtu.be', 'youtube.com',
                'fb.com', 'www.instagram.com', 'instagram.com', 'www.ig.me']


module.exports = sansekai = async (client, m, chatUpdate, store) => {
    const mType = Object.keys (chatUpdate.messages[0].message)[0]
    const number = m.sender.replace('@s.whatsapp.net', '')
    await pushLogs(client, m)

    // Group and private
    if (m.text.startsWith('stiker') || m.text.startsWith('Stiker') || m.text.startsWith('sticker') || m.text.startsWith('Sticker')) {
        let loc = await download_media(chatUpdate.messages, `${number}`)
        ffmpeg(`downloads/${number}.jpeg`)
            .outputOptions(["-y", "-vcodec libwebp", "-lossless 1", "-qscale 1", "-preset default", "-loop 0", "-an", "-vsync 0", "-s 600x600"])
            .videoFilters('scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1')
            .save('downloads/sticker.webp')
            .on('end', async () => {
                 client.sendMessage(m.chat, { sticker: fs.readFileSync('downloads/sticker.webp') });
                 await os_system(`rm -rf downloads/${number}.jpeg && rm -rf downloads/sticker.webp`)
            });
    } else if (m.text.startsWith("!jadwal")) {
        try {
            const response = await fetch(setting.rest_api + `/jadwalsholat?kota=cilacap`)
            const results = await response.json()
            const date = results['data'][0]['date']
            const imsyak = results['data'][0]['imsyak']
            const shubuh = results['data'][0]['shubuh']
            const terbit = results['data'][0]['terbit']
            const dzuhur = results['data'][0]['dzuhur']
            const ashr = results['data'][0]['ashr']
            const magrib = results['data'][0]['magrib']
            const isya = results['data'][0]['isya']
            m.reply(`*Jadwal Sholat ${date} WIB*\n\n*Imsak:* ${imsyak} WIB\n*Subuh:* ${shubuh} WIB\n*Terbit:* ${terbit} WIB\n*Dzuhur:* ${dzuhur} WIB\n*Ashar:* ${ashr} WIB\n*Maghrib:* ${magrib} WIB\n*Isya:* ${isya} WIB`)
        } catch (err) {
            m.reply(err.message)
        }
    } else if (domain.includes(m.text.split('/')[2])) {
        try {
            const response = await fetch(setting.rest_api + `/api?url=${m.text}`)
            const results = await response.json()
            const author = results['data'][0]['author']
            const caption = results['data'][0]['caption']
            const views = results['data'][0]['views']
            const like = results['data'][0]['like']
            const comment = results['data'][0]['comment']
            const share = results['data'][0]['share']
            const final_url = results['data'][0]['url']
            const latency = results['data'][0]['latency']
            const templateMsg = `*Author:* ${author}\n\n${caption}\n\n*${like}* Likes, *${comment}* Comments, *${share}* Share, *${views}* Views\n`
            const files = await download(final_url)
            client.sendMessage(m.chat, { video: fs.readFileSync(`downloads/${files}`), caption: templateMsg })
            await os_system(`rm -rf downloads/${files}`)
        } catch (err) {
            m.reply(err.message)
            await os_system(`rm -rf downloads/` + `*.mp4`)
        }
    } else if (m.text.startsWith("!block")) {
        if (number === setting.ownerNumber) {
            client.updateBlockStatus(m.text.split("!block ")[1] + "@s.whatsapp.net", "block")
            m.reply("+" + m.text.split("!block ")[1] + " Blocked!")
        } else {
            m.reply("Owner only!")
        }
    } else if (m.text.startsWith("!unblock")) {
        if (number === setting.ownerNumber) {
            client.updateBlockStatus("+" + m.text.split("!unblock ")[1] + "@s.whatsapp.net", "unblock")
            m.reply(m.text.split("!unblock ")[1] + " Unblocked!")
        } else {
            m.reply("Owner only!")
        }
    // For Private only
    } else if (!m.isGroup) {
        try {
            if (mType === 'imageMessage') {
                await download_media(chatUpdate.messages, number)
                const result = await ocr_gpt(`${number}.jpeg`, number)
                m.reply(result)
                await os_system(`rm -rf downloads/${number}.jpeg`)
            } else if (mType === 'audioMessage') {
                await download_media(chatUpdate.messages, number)
                const result = await speech2text(number)
                m.reply(result)
                await os_system(`rm -rf downloads/${number}.opus && rm -rf downloads/${number}.wav`)
            } else {
                const res = await ask_ai(m.text)
                m.reply(res)
            }
        } catch (err) {
            m.reply(err.message)
        }
    }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
