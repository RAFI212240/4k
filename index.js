const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

app.get('/', (req, res) => res.send("Upscale API is Running!"));

app.get('/api/upscale', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.json({ status: false, message: "URL is required" });

        // ১. ছবি ডাউনলোড করা (Facebook থেকে)
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        
        // ২. ফর্ম ডেটা তৈরি করা
        const form = new FormData();
        // ⚠️ ফিক্স: এখানে 'image.jpg' নামটা যোগ করা হলো, এটা না দিলে সার্ভার ছবি চিনতে পারে না
        form.append('image', imageResponse.data, 'image.jpg'); 
        form.append('upscale', '2'); 

        // ৩. Upscale.media তে রিকোয়েস্ট পাঠানো
        const response = await axios.post('https://api.upscale.media/v1/upscale', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:109.0) Gecko/109.0 Firefox/118.0',
                'Origin': 'https://www.upscale.media',
                'Referer': 'https://www.upscale.media/'
            }
        });

        const result = response.data;

        if (result.error) {
            return res.json({ status: false, message: "Failed to upscale from source" });
        }

        res.json({
            status: true,
            author: "RAFI",
            result: {
                input_url: imageUrl,
                upscaled_url: result.data.image
            }
        });

    } catch (error) {
        // এরর ডিবাগ করার জন্য কনসোলে প্রিন্ট হবে (Vercel Logs এ দেখা যাবে)
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = app;
                                          
