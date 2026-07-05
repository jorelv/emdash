const token = "cfoat_1WDxQTMEUpywtbB-KpLwOKhASCO1OF8rANwTPIzW-xQ.tNQ4w2UIsMIoZffKA5reOYOOlVrfe5fPT1H-MusZvzw";
const accountId = "7686b4e46c85758ae2f0bd9ae59fbb68";
const serviceName = "emdash";

async function main() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services/${serviceName}/environments/production/content`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Status:', res.status);
  const contentType = res.headers.get('content-type');
  console.log('Content-Type:', contentType);

  if (contentType && contentType.includes('multipart')) {
    const text = await res.text();
    console.log('Multipart body length:', text.length);
    // Write the raw multipart body to a file so we can inspect and parse it
    const fs = require('fs');
    fs.writeFileSync('worker-raw.multipart', text);
    console.log('Saved raw multipart body to worker-raw.multipart');
  } else {
    const text = await res.text();
    console.log('Response content:', text.substring(0, 1000));
  }
}

main().catch(console.error);
