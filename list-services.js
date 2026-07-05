const token = "cfoat_1WDxQTMEUpywtbB-KpLwOKhASCO1OF8rANwTPIzW-xQ.tNQ4w2UIsMIoZffKA5reOYOOlVrfe5fPT1H-MusZvzw";
const accountId = "7686b4e46c85758ae2f0bd9ae59fbb68";

async function main() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Status:', res.status);
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch(console.error);
