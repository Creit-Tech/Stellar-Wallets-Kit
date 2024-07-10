export function applyModalStyles(modalElement: HTMLElement, colors: { [key: string]: string }) {
    for (const [key, value] of Object.entries(colors)) {
      modalElement.style.setProperty(`--${key}`, value);
    }
  }
  