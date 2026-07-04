// API TIKTOK DOWNLOADER
// PASTE INI DI FOLDER: api/download.js

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ success: false, message: 'URL kosong!' });
    }

    try {
        const formData = new URLSearchParams();
        formData.append('url', url);
        formData.append('hd', '1');

        const response = await fetch('https://www.tikwm.com/api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            },
            body: formData
        });

        const data = await response.json();

        if (data.code === 0 && data.data) {
            return res.status(200).json({
                success: true,
                videoUrl: data.data.hdplay || data.data.play,
                audioUrl: data.data.music || '',
                author: data.data.author?.nickname || 'TikTok User',
                views: data.data.play_count || 0,
                likes: data.data.digg_count || 0
            });
        }

        throw new Error('Gagal');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal download: ' + error.message
        });
    }
}
