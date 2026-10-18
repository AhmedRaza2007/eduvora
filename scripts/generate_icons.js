const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Generate logos with exact pixel dimensions (deviceScaleFactor = 1)
  const sizes = [
    { size: 16, filename: 'icon-16.png' },
    { size: 32, filename: 'icon-32.png' },
    { size: 64, filename: 'icon-64.png' },
    { size: 180, filename: 'apple-icon.png' },
    { size: 192, filename: 'icon-192.png' },
    { size: 512, filename: 'icon-512.png' }
  ];

  for (const s of sizes) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${s.size}px;
            height: ${s.size}px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .logo {
            width: ${s.size}px;
            height: ${s.size}px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
            border-radius: ${Math.round(s.size * 0.28)}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 900;
            font-size: ${Math.round(s.size * 0.52)}px;
            letter-spacing: -${Math.round(s.size * 0.04)}px;
            box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 ${Math.round(s.size * 0.08)}px ${Math.round(s.size * 0.16)}px rgba(99,102,241,0.4);
            border: ${Math.max(1, Math.round(s.size * 0.03))}px solid rgba(255,255,255,0.3);
          }
        </style>
      </head>
      <body>
        <div class="logo">EV</div>
      </body>
      </html>
    `;

    // deviceScaleFactor: 1 ensures the pixel dimensions of the PNG match s.size EXACTLY
    await page.setViewport({ width: s.size, height: s.size, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 50));
    await page.screenshot({
      path: path.join(__dirname, '..', 'public', s.filename),
      omitBackground: true
    });
    console.log(`Generated public/${s.filename} (${s.size}x${s.size})`);
  }

  await browser.close();

  // Create standard multi-resolution favicon.ico containing 16x16 and 32x32 PNGs
  const png16 = fs.readFileSync(path.join(__dirname, '..', 'public', 'icon-16.png'));
  const png32 = fs.readFileSync(path.join(__dirname, '..', 'public', 'icon-32.png'));

  const count = 2;
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // type: 1 = ICO
  icoHeader.writeUInt16LE(count, 4); // 2 images

  // Entry 1: 16x16
  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(16, 0); // width
  entry1.writeUInt8(16, 1); // height
  entry1.writeUInt8(0, 2);  // color palette
  entry1.writeUInt8(0, 3);  // reserved
  entry1.writeUInt16LE(1, 4);  // color planes
  entry1.writeUInt16LE(32, 6); // bpp
  entry1.writeUInt32LE(png16.length, 8); // size
  entry1.writeUInt32LE(6 + 16 * count, 12); // offset (6 + 32 = 38)

  // Entry 2: 32x32
  const entry2 = Buffer.alloc(16);
  entry2.writeUInt8(32, 0); // width
  entry2.writeUInt8(32, 1); // height
  entry2.writeUInt8(0, 2);  // color palette
  entry2.writeUInt8(0, 3);  // reserved
  entry2.writeUInt16LE(1, 4);  // color planes
  entry2.writeUInt16LE(32, 6); // bpp
  entry2.writeUInt32LE(png32.length, 8); // size
  entry2.writeUInt32LE(6 + 16 * count + png16.length, 12); // offset

  const icoBuffer = Buffer.concat([icoHeader, entry1, entry2, png16, png32]);

  // Write favicon.ico to both public/ and src/app/
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);
  fs.copyFileSync(path.join(__dirname, '..', 'public', 'icon-32.png'), path.join(__dirname, '..', 'public', 'icon.png'));

  console.log('Successfully generated multi-res favicon.ico (16x16 and 32x32) with 100% matching dimensions!');
})();
