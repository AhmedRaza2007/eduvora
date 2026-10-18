const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PORT = 3847;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Simple static server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/promo-video.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webm': 'video/webm',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Promo server running on http://localhost:${PORT}`);

  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: false, // Run in a visible window so media recorder has full GPU/canvas acceleration
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--autoplay-policy=no-user-gesture-required'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Loading video studio page...');
    await page.goto(`http://localhost:${PORT}/promo-video.html`, { waitUntil: 'networkidle2' });

    // Wait for images to settle
    await new Promise(r => setTimeout(r, 2000));

    console.log('Recording 35-second 1080p video frames @ 30 FPS...');
    const result = await page.evaluate(async () => {
      return await window.eduvoraRecordHeadless();
    });

    const outputPath = path.join(PUBLIC_DIR, 'eduvora-launch-video.webm');
    fs.writeFileSync(outputPath, Buffer.from(result.base64, 'base64'));

    console.log(`SUCCESS: Video saved to ${outputPath}`);
    console.log(`Video size: ${(result.size / (1024 * 1024)).toFixed(2)} MB`);

    await browser.close();
  } catch (err) {
    console.error('Error during video rendering:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
