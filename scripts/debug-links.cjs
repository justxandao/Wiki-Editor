const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://wiki.pokexgames.com/api.php?action=parse&page=Pok%C3%A9mon&prop=links&limit=500&formatversion=2&format=json';
  console.log('Fetching page list...');
  const raw = await fetchUrl(url);
  const json = JSON.parse(raw);
  console.log('Keys of response:', Object.keys(json));
  if (json.parse) {
    console.log('Keys of json.parse:', Object.keys(json.parse));
    if (json.parse.links) {
      console.log('Links count:', json.parse.links.length);
      console.log('Sample links (first 10):', json.parse.links.slice(0, 10));
    }
  }
}

main().catch(console.error);
