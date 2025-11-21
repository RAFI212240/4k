const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

app.get('/', (req, res) => res.send("Vyro Upscale API is Running!"));

app.get('/api/upscale', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.status(400).json({ message: "URL is required" });

        // ১. ছবি ডাউনলোড করা
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // ২. Vyro AI-এর জন্য ডেটা সাজানো
        const form = new FormData();
        form.append('model_version', '1');
        form.append('image', imageResponse.data, 'image.jpg');

        // ৩. Vyro সার্ভারে পাঠানো
        const response = await axios.post('https://inferenceengine.vyro.ai/enhance', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'okhttp/4.9.3', // মোবাইলের মতো ভাব ধরছি
            },
            responseType: 'arraybuffer' // সরাসরি ছবি রিসিভ করবো
        });

        // ৪. সরাসরি ছবি ব্রাউজারে/বটে পাঠিয়ে দেওয়া
        res.set('Content-Type', 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to upscale image." });
    }
});

module.exports = app;
        
