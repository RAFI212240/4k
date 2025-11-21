// api/index.js
const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
    // ১. CORS অনুমতি (যাতে অন্য ওয়েবসাইট থেকে কল করা যায়)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    // ২. ইনপুট চেক করা (Image URL)
    const { url, scale } = req.query; 
    // ব্যবহার: your-vercel-link/api?url=IMAGE_LINK&scale=2

    if (!url) {
        return res.status(400).json({ 
            status: false, 
            message: "❌ Please provide an image URL. Example: ?url=https://example.com/img.jpg" 
        });
    }

    try {
        // ৩. ইমেজ ডাউনলোড করা (User-এর দেওয়া URL থেকে)
        const imageResponse = await axios.get(url, { responseType: 'stream' });

        // ৪. ফর্ম ডেটা তৈরি করা BetterImage-এর জন্য
        const form = new FormData();
        form.append('image', imageResponse.data);
        form.append('scale', scale || '2'); // ডিফল্ট 2x, ইউজার চাইলে 4x দিতে পারে

        // ৫. BetterImage API তে রিকোয়েস্ট পাঠানো
        // বি:দ্র: তাদের ব্যাকএন্ড URL সাধারণত /api/upload হয়
        const betterImageResponse = await axios.post('https://betterimage.ai/api/upload', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://betterimage.ai',
                'Referer': 'https://betterimage.ai/'
            }
        });

        // ৬. সফল রেজাল্ট পাঠানো
        if (betterImageResponse.data) {
            return res.status(200).json({
                status: true,
                creator: "Goat Bot Dev",
                result: betterImageResponse.data
            });
        } else {
            throw new Error("No data received from BetterImage");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
