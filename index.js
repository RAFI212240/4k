const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

app.get('/', (req, res) => res.send("Upscale API Running!"));

app.get('/api/upscale', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.json({ status: false, message: "URL is required" });

        // ১. ছবি ডাউনলোড করা
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        
        // ২. ফর্ম ডেটা তৈরি করা
        const form = new FormData();
        form.append('image', imageResponse.data);
        // প্যারামিটার (2x বা 4x)
        form.append('upscale', '2'); 

        // ৩. Upscale.media এর গোপন API-তে রিকোয়েস্ট পাঠানো
        const response = await axios.post('https://api.upscale.media/v1/upscale', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Origin': 'https://www.upscale.media',
                'Referer': 'https://www.upscale.media/'
            }
        });

        const result = response.data;

        if (result.error) {
            return res.json({ status: false, message: "Failed to upscale" });
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
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = app;
      
