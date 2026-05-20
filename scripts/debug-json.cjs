const fs = require('fs');
const stepFile = 'C:\\Users\\Alexandre\\.gemini\/\/antigravity\\brain\\41975544-d09c-436a-b772-1a9172f7d872\\.system_generated\\steps\\1426\\content.md';
const content = fs.readFileSync(stepFile, 'utf8');
const jsonPart = content.substring(content.indexOf('{"parse"')).trim();
console.log('JSON Part start:', jsonPart.substring(0, 100));
console.log('JSON Part end:', jsonPart.substring(jsonPart.length - 100));
try {
  const data = JSON.parse(jsonPart);
  console.log('Success parsing JSON!');
} catch (e) {
  console.log('Error parsing JSON:', e.message);
  // Find where the problem is
  const pos = e.message.match(/position (\d+)/);
  if (pos) {
    const idx = parseInt(pos[1]);
    console.log('Problem section:', jsonPart.substring(idx - 50, idx + 50));
  }
}
