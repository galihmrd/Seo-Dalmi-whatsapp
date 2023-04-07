const fetch = require('node-fetch')
let setting = require('../key.json')


const domain = ['vt.tiktok.com', 'app-va.tiktokv.com', 'vm.tiktok.com',
                'm.tiktok.com', 'tiktok.com', 'www.tiktok.com',
                'link.e.tiktok.com', 'us.tiktok.com','vt.tiktok.com',
                'app-va.tiktokv.com', 'm.tiktok.com', 'm.tiktok.com',
                'tiktok.com', 'www.tiktok.com', 'link.e.tiktok.com',
                'us.tiktok.com', 'fb.watch', 'www.facebook.com',  'fb.me', 'www.youtube.com', 'youtu.be', 'youtube.com',
                'fb.com', 'www.instagram.com', 'instagram.com', 'www.ig.me']


module.exports = sansekai = async (client, m, chatUpdate, store) => {
    if (domain.includes(m.text.split('/')[2])) {
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
            const templateMsg = `*Author:* ${author}\n\n${caption}\n\n*${like}* Likes, *${comment}* Comments, *${share}* Share, *${views}* Views, *${latency}ms* Latency\n`
            client.sendMessage(m.chat, { video: { url: final_url }, caption: templateMsg })
        } catch {
            m.reply('*Error:* Silahkan Coba lagi, jika pesan ini terus menerus muncul, hubungi pemilik bot ini')
        }
    }
}
