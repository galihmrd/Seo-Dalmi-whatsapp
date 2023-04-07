const fs = require('fs')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const { os_system, download_media } = require('../helpers/func')

const setting = require('../key.json')


module.exports = sansekai = async (client, m, chatUpdate, store) => {
    const mType = Object.keys (chatUpdate.messages[0].message)[0]
    if (m.text.startsWith('stiker') || m.text.startsWith('Stiker') || m.text.startsWith('sticker') || m.text.startsWith('Sticker')) {
        let number = m.sender.replace('@s.whatsapp.net', '')
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
    }
}
