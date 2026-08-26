const express = require('express');
const path = require('path');
const QRCode = require('qrcode');
const CryptoJS = require('crypto-js');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// API: Generate QR Code
app.post('/api/qr-code', async (req, res) => {
  try {
    const { text, size = 200 } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const qrCodeDataUrl = await QRCode.toDataURL(text, { width: parseInt(size) });
    res.json({ success: true, qrCode: qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// API: Password Generator
app.post('/api/password-generator', (req, res) => {
  try {
    const { length = 12, includeUppercase = true, includeNumbers = true, includeSymbols = true } = req.body;
    
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    res.json({ success: true, password });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

// API: URL Shortener (simulation)
app.post('/api/url-shortener', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    // Simulate short URL generation
    const shortCode = Math.random().toString(36).substring(2, 8);
    const shortUrl = `https://short.ly/${shortCode}`;
    
    res.json({ success: true, originalUrl: url, shortUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// API: Text Converter
app.post('/api/text-converter', (req, res) => {
  try {
    const { text, operation } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    let result = '';
    switch (operation) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'titlecase':
        result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'reverse':
        result = text.split('').reverse().join('');
        break;
      case 'wordcount':
        result = text.trim().split(/\s+/).length.toString();
        break;
      case 'charcount':
        result = text.length.toString();
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert text' });
  }
});

// API: Base64 Encoder/Decoder
app.post('/api/base64', (req, res) => {
  try {
    const { text, operation } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    let result = '';
    if (operation === 'encode') {
      result = Buffer.from(text).toString('base64');
    } else if (operation === 'decode') {
      result = Buffer.from(text, 'base64').toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Invalid operation' });
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process base64' });
  }
});

// API: Color Converter
app.post('/api/color-converter', (req, res) => {
  try {
    const { color, fromFormat, toFormat } = req.body;
    if (!color) return res.status(400).json({ error: 'Color is required' });
    
    let rgb = null;
    
    // Convert to RGB first
    if (fromFormat === 'hex') {
      const hex = color.replace('#', '');
      rgb = {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    } else if (fromFormat === 'rgb') {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      }
    }
    
    if (!rgb) return res.status(400).json({ error: 'Invalid color format' });
    
    let result = '';
    if (toFormat === 'hex') {
      result = '#' + [rgb.r, rgb.g, rgb.b].map(x => x.toString(16).padStart(2, '0')).join('');
    } else if (toFormat === 'rgb') {
      result = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    } else if (toFormat === 'hsl') {
      const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      result = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert color' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
