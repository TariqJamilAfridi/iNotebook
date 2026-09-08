/**
 * gen-favicon.js
 * Generates a fresh favicon.ico (and favicon.png) for iNotebook.
 * Uses only built-in Node.js — no npm packages required.
 *
 * Output: public/favicon.ico  (16x16 + 32x32 multi-size ICO)
 *         public/favicon-32.png
 */

const fs   = require('fs');
const path = require('path');

// ── Minimal PNG encoder (pure JS, no deps) ─────────────────────────────────
// Produces a valid RGBA PNG from a flat Uint8Array of pixels [r,g,b,a, r,g,b,a …]

function crc32(buf) {
    const table = (() => {
        const t = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
            t[i] = c;
        }
        return t;
    })();
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

function adler32(buf) {
    let a = 1, b = 0;
    for (let i = 0; i < buf.length; i++) { a = (a + buf[i]) % 65521; b = (b + a) % 65521; }
    return (b << 16) | a;
}

function deflateRaw(data) {
    // Store-only deflate (no compression) — valid for small images
    const chunks = [];
    let offset = 0;
    while (offset < data.length) {
        const end  = Math.min(offset + 65535, data.length);
        const last = end === data.length ? 1 : 0;
        const len  = end - offset;
        const buf  = Buffer.alloc(5 + len);
        buf[0] = last;
        buf.writeUInt16LE(len,         1);
        buf.writeUInt16LE(~len & 0xFFFF, 3);
        data.copy(buf, 5, offset, end);
        chunks.push(buf);
        offset = end;
    }
    return Buffer.concat(chunks);
}

function zlib(data) {
    const raw  = deflateRaw(Buffer.from(data));
    const a    = adler32(data) >>> 0;   // force unsigned 32-bit
    const head = Buffer.from([0x78, 0x01]);
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(a >>> 0, 0);
    return Buffer.concat([head, raw, tail]);
}

function chunk(type, data) {
    const t   = Buffer.from(type);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
}

function encodePNG(width, height, pixels) {
    // pixels: Uint8Array [r,g,b,a * width*height]
    const sig = Buffer.from([137,80,78,71,13,10,26,10]);

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width,  0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8]  = 8;  // bit depth
    ihdr[9]  = 6;  // colour type: RGBA
    ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

    // Build raw scanlines (filter byte 0 + RGBA row)
    const raw = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        raw[y * (1 + width * 4)] = 0; // filter = None
        for (let x = 0; x < width; x++) {
            const src = (y * width + x) * 4;
            const dst = y * (1 + width * 4) + 1 + x * 4;
            raw[dst]   = pixels[src];
            raw[dst+1] = pixels[src+1];
            raw[dst+2] = pixels[src+2];
            raw[dst+3] = pixels[src+3];
        }
    }

    return Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib(raw)),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

// ── Draw the iNotebook icon ────────────────────────────────────────────────
// Returns a flat Uint8Array of RGBA pixels for a SIZE×SIZE icon

function drawIcon(SIZE) {
    const px = new Uint8Array(SIZE * SIZE * 4);

    function setPixel(x, y, r, g, b, a = 255) {
        if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
        const i = (y * SIZE + x) * 4;
        // simple alpha compositing over existing colour
        const sa = a / 255, da = px[i+3] / 255;
        const oa = sa + da * (1 - sa);
        if (oa === 0) return;
        px[i]   = Math.round((r * sa + px[i]   * da * (1 - sa)) / oa);
        px[i+1] = Math.round((g * sa + px[i+1] * da * (1 - sa)) / oa);
        px[i+2] = Math.round((b * sa + px[i+2] * da * (1 - sa)) / oa);
        px[i+3] = Math.round(oa * 255);
    }

    function fillRect(x, y, w, h, r, g, b, a = 255) {
        for (let dy = 0; dy < h; dy++)
            for (let dx = 0; dx < w; dx++)
                setPixel(x+dx, y+dy, r, g, b, a);
    }

    function circle(cx, cy, radius, r, g, b, a = 255) {
        for (let dy = -radius; dy <= radius; dy++)
            for (let dx = -radius; dx <= radius; dx++)
                if (dx*dx + dy*dy <= radius*radius)
                    setPixel(Math.round(cx+dx), Math.round(cy+dy), r, g, b, a);
    }

    // Scale factor
    const S = SIZE / 32;
    const round = v => Math.round(v * S);

    // Background: purple rounded square (simulate rounding by just filling)
    // Purple gradient approximated as solid #6c63ff
    fillRect(0, 0, SIZE, SIZE, 108, 99, 255);

    // Slightly lighter top-right for gradient feel
    for (let y = 0; y < SIZE/2; y++)
        for (let x = SIZE/2; x < SIZE; x++) {
            const blend = 0.15 * (1 - y/(SIZE/2)) * ((x - SIZE/2)/(SIZE/2));
            setPixel(x, y,
                Math.min(255, Math.round(108 + 148*blend)),
                Math.min(255, Math.round(99  + 151*blend)),
                255, 255
            );
        }

    // Spine (dark left bar)
    fillRect(round(3), round(4), round(5), round(24), 60, 52, 180);

    // Page (white area)
    fillRect(round(8), round(4), round(21), round(24), 245, 244, 255);

    // Ruled lines on page (light purple)
    const lineY = [round(10), round(14), round(18), round(22)];
    lineY.forEach((ly, i) => {
        const alpha = i < 3 ? 200 : 130;
        fillRect(round(10), ly, round(16), Math.max(1, round(1.2)), 180, 170, 255, alpha);
    });

    // Spiral rings on spine
    [round(8), round(16), round(24)].forEach(ry => {
        circle(round(5.5), ry, Math.max(1, round(1.5)), 255, 255, 255, 200);
    });

    // Bookmark ribbon top-right corner (red triangle)
    const bx = round(25), bw = round(4), bh = round(7);
    for (let dy = 0; dy < bh; dy++) {
        fillRect(bx, round(4) + dy, bw, 1, 235, 59, 90);
    }
    // pointed bottom of bookmark
    for (let dy = 0; dy < Math.max(1, round(2)); dy++) {
        const trim = Math.round(bw * dy / round(2));
        fillRect(bx + trim, round(4) + bh + dy, bw - trim*2, 1, 235, 59, 90);
    }

    return px;
}

// ── Encode ICO file (supports multiple sizes) ─────────────────────────────
// ICO spec: 6-byte header + N×16-byte directory entries + N PNG blobs

function encodeICO(sizes) {
    const images = sizes.map(s => ({ size: s, png: encodePNG(s, s, drawIcon(s)) }));

    const headerSize = 6;
    const dirSize    = 16 * images.length;
    let   offset     = headerSize + dirSize;

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type: ICO
    header.writeUInt16LE(images.length, 4);

    const dirs = images.map(img => {
        const dir = Buffer.alloc(16);
        dir[0] = img.size >= 256 ? 0 : img.size; // width  (0 = 256)
        dir[1] = img.size >= 256 ? 0 : img.size; // height
        dir[2] = 0;   // colour count
        dir[3] = 0;   // reserved
        dir.writeUInt16LE(1, 4);  // colour planes
        dir.writeUInt16LE(32, 6); // bits per pixel
        dir.writeUInt32LE(img.png.length, 8);
        dir.writeUInt32LE(offset, 12);
        offset += img.png.length;
        return dir;
    });

    return Buffer.concat([header, ...dirs, ...images.map(i => i.png)]);
}

// ── Write files ────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public');

// ICO with 16×16 and 32×32 embedded
const icoBuffer = encodeICO([16, 32]);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), icoBuffer);
//console.log('✓ public/favicon.ico written (' + icoBuffer.length + ' bytes)');

// Standalone 32×32 PNG
const png32 = encodePNG(32, 32, drawIcon(32));
fs.writeFileSync(path.join(outDir, 'favicon-32.png'), png32);
//console.log('✓ public/favicon-32.png written');

//console.log('\nDone! Restart the dev server and hard-refresh (Ctrl+Shift+R) to see the new icon.');
