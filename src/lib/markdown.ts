export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*)`/gim, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

  // Wrap lists
  html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>)/gms, '<ul class="my-4">$1</ul>');
  html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>)/gms, '<ol class="my-4">$1</ol>');

  // Handle line breaks for paragraphs (if not already handled by block tags)
  return html.split('\n').map(line => {
    if (line.trim() === '') return '<br/>';
    if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<li') || line.startsWith('<blockquote')) {
      return line;
    }
    return `<p class="my-2">${line}</p>`;
  }).join('');
}
