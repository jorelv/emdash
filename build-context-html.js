import fs from 'fs';

async function main() {
  const res = await fetch('https://emdash.jorelv.workers.dev/llms-full.txt');
  const txt = await res.text();
  
  // Write raw text files
  fs.writeFileSync('llms-full.txt', txt);
  if (!fs.existsSync('context-site')) {
    fs.mkdirSync('context-site');
  }
  fs.writeFileSync('context-site/llms-full.txt', txt);
  
  const escaped = txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jorel's Blog - Full Site Context (llms-full.txt)</title>
  <meta name="description" content="Complete site context for Jorel's Blog. Optimized for LLM ingestion.">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1e293b; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 1rem; }
  </style>
</head>
<body>
<p>This page serves the raw LLM context file. You can access the raw text file directly at <a href="/llms-full.txt">/llms-full.txt</a>.</p>
<hr>
<pre>${escaped}</pre>
</body>
</html>`;

  fs.writeFileSync('context-site/index.html', html);
  console.log('llms-full.txt and index.html written successfully.');
}

main();
