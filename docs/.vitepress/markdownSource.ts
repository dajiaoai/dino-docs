// Page data is embedded in a Vue <script> block. Encode markup so source
// containing </script> cannot terminate that block before Vue compiles it.
export function encodeMarkdownSource(source: string): string {
  return encodeURIComponent(source);
}

export function decodeMarkdownSource(encoded: unknown): string {
  if (typeof encoded !== 'string') return '';
  try {
    return decodeURIComponent(encoded);
  } catch {
    return '';
  }
}
