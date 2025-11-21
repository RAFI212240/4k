const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const https = require('https');
const app = express();

app.get('/', (req, res) => res.send("Vyro Upscale API is Running!"));

app.get('/api/upscale', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.status(400).json({ message: "URL is required" });

        // ১. ছবি ডাউনলোড
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        
        // ২. ফর্ম ডেটা
        const form = new FormData();
        form.append('model_version', '1');
        form.append('image', imageResponse.data, 'image.jpg');

        // 🛠️ ফিক্স: কড়া SSL বাইপাস
        const agent = new https.Agent({  
            rejectUnauthorized: false, // সার্টিফিকেট চেক করবে না
            checkServerIdentity: () => undefined // ডোমেইন নেম চেক করবে না (Error 112 ফিক্স)
        });

        // ৩. Vyro সার্ভারে পাঠানো
        const response = await axios.post('https://inferenceengine.vyro.ai/enhance', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'okhttp/4.9.3',
            },
            httpsAgent: agent, 
            responseType: 'arraybuffer'
        });

        // ৪. ছবি পাঠানো
        res.set('Content-Type', 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error("Upscale Error Details:", error.code, error.message);
        res.status(500).json({ 
            message: "Failed to upscale.", 
            error: error.message,
            code: error.code 
        });
    }
});

module.exports = app;
