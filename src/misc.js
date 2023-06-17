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
                'fb.com', 'www.instagram.com', 'instagram.com', 'www.ig.me', 'pin.it']

const yt_domain = ['www.youtube.com', 'youtu.be', 'youtube.com']

module.exports = sansekai = async (client, m, chatUpdate, store) => {
    const mType = Object.keys (chatUpdate.messages[0].message)[0]
    const number = m.sender.replace('@s.whatsapp.net', '')
    const blacklist = ['12345']
    const time = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"})
    if (!m.isGroup) {
        const status_msg = `${m.pushName} Mengakses bot pada - ${time}`
        await client.updateProfileStatus(status_msg)
    }
    await pushLogs(client, m)
    if (!number.includes(blacklist)) {
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
                const templateMsg = `*Uploaded by* ${author}\n\n${caption}\n\n*${like}* Likes, *${comment}* Comments, *${share}* Share, *${views}* Views\n`
                const len = results['data'][0]['len_url']
                console.log(final_url)
                console.log(len)
                if (len > 1) {
                    for (let i = 0; i <= len - 1; i++) {
                        link = final_url[i]
                        if (link.includes("jpg") || link.includes("jpeg") || link.includes("heic") || link.includes("png")) {
                            client.sendMessage(m.chat, { image: { url: link }})
                        } else {
                            client.sendMessage(m.chat, { video: { url: link }})
                        }
                    }
                    m.reply(templateMsg)
                } else {
                    if (yt_domain.includes(m.text.split('/')[2])) {
                        const files = await download(final_url)
                        client.sendMessage(m.chat, { video: fs.readFileSync(`downloads/${files}`), caption: templateMsg })
                        await os_system(`rm -rf downloads/${files}`)
                    } else{
                        if (final_url.includes("jpg") || final_url.includes("jpeg") || final_url.includes("heic") || final_url.includes("png")) {
                            console.log(final_url)
                            client.sendMessage(m.chat, { image: { url: final_url }, caption: templateMsg })
                        } else {
                            console.log(final_url)
                            client.sendMessage(m.chat, { video: { url: final_url }, caption: templateMsg })
                        }
                    }
                }
            } catch (err) {
                m.reply(err.message)
                await os_system(`rm -rf downloads/` + `*.mp4`)
            }
        } else if (m.text.startsWith("!infogempa")) {
            try {
                const response = await fetch(setting.rest_api + `/quake`)
                const results = await response.json()
                const date = results['data']['tanggal']
                const time = results['data']['jam']
                const coordinates = results['data']['coordinates']
                const magnitude = results['data']['magnitude']
                const deep = results['data']['kedalaman']
                const wilayah = results['data']['wilayah']
                const potensi = results['data']['potensi']
                const dirasakan = results['data']['dirasakan']
                const map = results['data']['shakemap']
                const templateMsg = `*• Waktu:* ${date} | ${time}\n*• Status:* ${potensi}\n*• Pusat Gempa:* ${wilayah}\n\n*Magnitude* ${magnitude} | *Kedalaman* ${deep} | *Koordinat* ${coordinates}\n\n*• Dirasakan:* ${dirasakan}\n\nSumber: BMKG`
                client.sendMessage(m.chat, { image: { url: map }, caption: templateMsg })
            } catch (err) {
                m.reply(err.message)
            }
        // For Private only
        } else if (!m.isGroup) {
            console.log(mType)
            try {
                if (mType === 'documentMessage') {
                    const msg = "\n\nSilahkan unduh dan kirim ke status Whatsapp kamu!\n\n"
                    await download_media(chatUpdate.messages, m.text, number)
                    if (m.text.includes("mp4")) {
                        client.sendMessage(m.chat, { video: fs.readFileSync(`downloads/${number}.mp4`), caption: msg })
                        await os_system(`rm -rf downloads/${number}.mp4`)
                    } else {
                        client.sendMessage(m.chat, { image: fs.readFileSync(`downloads/${number}.jpg`), caption: msg })
                        await os_system(`rm -rf downloads/${number}.jpg`)
                    }
                } else if (mType === 'imageMessage') {
                    await download_media(chatUpdate.messages, m.text, number)
                    const result = await ocr_gpt(`${number}.jpeg`, number)
                    m.reply(result)
                    await os_system(`rm -rf downloads/${number}.jpeg`)
                } else if (mType === 'audioMessage') {
                    await download_media(chatUpdate.messages, m.text, number)
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
    } else {
        m.reply(setting.blockMessage)
    }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
