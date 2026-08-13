import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShareService {
  async shareOrCopy(url: string, title: string, text: string): Promise<'shared' | 'copied'> {
    const share = navigator.share;
    if (typeof share === 'function' && window.isSecureContext) {
      try {
        await share.call(navigator, { title, text, url });
        return 'shared';
      } catch (error) {
        // Safari can reject the share sheet when the async API call consumed user activation.
        // Fall through to the clipboard path so every browser still gets a useful result.
      }
    }
    await this.copyText(url);
    return 'copied';
  }

  private async copyText(value: string): Promise<void> {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch {
        // Continue with the legacy Safari-compatible fallback.
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard access was denied.');
  }
}
