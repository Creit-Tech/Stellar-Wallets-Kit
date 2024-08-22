export async function copyToClipboard(textToCopy: string): Promise<void> {
  if (!textToCopy) {
    throw new Error(`Text to copy to the clipboard can't be undefined`);
  }

  await navigator.clipboard.writeText(textToCopy);
}
