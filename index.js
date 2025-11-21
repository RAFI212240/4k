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

        // ১. ছবি ডাউনলোড করা
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        
        // ২. ফর্ম ডেটা তৈরি করা
        const form = new FormData();
        form.append('model_version', '1');
        form.append('image', imageResponse.data, 'image.jpg');

        // 🛠️ ফিক্স: SNI এবং SSL সমস্যার সমাধান
        const agent = new https.Agent({  
            rejectUnauthorized: false,
            servername: 'inferenceengine.vyro.ai' // 💥 এই লাইনটি এরর ১১২ সমাধান করবে
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

        // ৪. সরাসরি ছবি পাঠানো
        res.set('Content-Type', 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error("Upscale Error:", error.message);
        if (error.response) {
            // এরর লগ দেখার জন্য
            console.error("Server Response:", error.response.status, error.response.statusText);
        }
        res.status(500).json({ message: "Failed to upscale image.", error: error.message });
    }
});

module.exports = app;
