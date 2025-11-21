const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const https = require('https'); // নতুন মডিউল
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

        // 🛠️ ফিক্স: SSL বাইপাস করার জন্য এজেন্ট তৈরি
        const agent = new https.Agent({  
            rejectUnauthorized: false // এটি SSL এরর বন্ধ করবে
        });

        // ৩. Vyro সার্ভারে পাঠানো
        const response = await axios.post('https://inferenceengine.vyro.ai/enhance', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'okhttp/4.9.3',
            },
            httpsAgent: agent, // এজেন্ট ব্যবহার করা হচ্ছে
            responseType: 'arraybuffer'
        });

        // ৪. সরাসরি ছবি পাঠানো
        res.set('Content-Type', 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error("Upscale Error:", error.message);
        // এরর ডিটেইলস দেখালে সমস্যা বোঝা সহজ হবে
        if (error.response) {
            console.error(error.response.data.toString());
        }
        res.status(500).json({ message: "Failed to upscale image.", error: error.message });
    }
});

module.exports = app;
                
