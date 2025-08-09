export function cleanBuffText(text: string): string {
  // Replace color tags with just their content
  text = text.replace(/<color=[^>]+>([^<]+)<\/color>/g, '$1');
  
  // Replace \n with proper line breaks for JSX
  const lines = text.split('\\n');
  
  return lines.join('\n');
}
