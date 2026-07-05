import fs from 'fs';

async function main() {
  const res = await fetch('https://emdash.jorelv.workers.dev/context.md');
  const md = await res.text();
  
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jorel's Blog - Full Site Context</title>
  <meta name="description" content="Complete site context for Jorel's Blog including all posts and about page. Optimized for LLM ingestion.">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1e293b; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 1rem; }
  </style>
</head>
<body>
<pre>${escaped}</pre>
</body>
</html>`;

  fs.writeFileSync('context-site/index.html', html);
  console.log('HTML written, length:', html.length);
}

main();
