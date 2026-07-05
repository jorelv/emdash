const fs = require('fs');
const path = require('path');

async function main() {
  const buffer = fs.readFileSync('worker-raw.multipart');
  const boundary = '--d6f000bca78120cc39e3d7e62df25639857e318d975c5d58008715f28646';
  const boundaryBytes = Buffer.from(boundary);

  const parts = [];
  let offset = 0;

  while (offset < buffer.length) {
    const index = buffer.indexOf(boundaryBytes, offset);
    if (index === -1) {
      parts.push(buffer.subarray(offset));
      break;
    }
    if (index > offset) {
      parts.push(buffer.subarray(offset, index));
    }
    offset = index + boundaryBytes.length;
  }

  console.log('Found parts:', parts.length);
  fs.mkdirSync('extracted-worker', { recursive: true });

  const manifest = [];

  for (const part of parts) {
    let start = 0;
    if (part[0] === 13 && part[1] === 10) start = 2; // skip \r\n
    
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) continue;
    
    const headers = part.subarray(start, headerEnd).toString();
    let bodyEnd = part.length;
    if (part[part.length - 2] === 13 && part[part.length - 1] === 10) {
      bodyEnd = part.length - 2;
    }
    
    const body = part.subarray(headerEnd + 4, bodyEnd);
    
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

    if (nameMatch) {
      const name = nameMatch[1];
      const filename = filenameMatch ? filenameMatch[1] : null;
      const contentType = contentTypeMatch ? contentTypeMatch[1] : null;

      manifest.push({ name, filename, contentType, headers });

      const destFilename = filename ? filename : `_part_${name}`;
      const destPath = path.join('extracted-worker', destFilename);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, body);
    }
  }

  fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Extracted files successfully. Saved manifest to manifest.json');
}

main().catch(console.error);
