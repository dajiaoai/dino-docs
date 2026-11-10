/** Open document images without changing the DOM structure managed by Vue. */
export function openDocumentImage(event: MouseEvent | KeyboardEvent): void {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.closest('.vp-doc')) return;
  if (image.closest('button, [role="button"]')) return;

  if (event.type === 'keydown') {
    if ((event as KeyboardEvent).key !== 'Enter' || (event as KeyboardEvent).repeat) return;
  } else {
    const button = (event as MouseEvent).button;
    if (button !== 0 && button !== 1) return;
  }

  const source = image.currentSrc || image.getAttribute('src');
  if (!source) return;

  // Prevent enclosing links and VitePress routing from navigating the current tab.
  event.preventDefault();
  event.stopPropagation();
  window.open(new URL(source, document.baseURI).href, '_blank', 'noopener,noreferrer');
}

export function enableDocumentImageLinks(): () => void {
  const enhanceImages = () => {
    const english = document.documentElement.lang.startsWith('en');
    const hint = english ? 'Open image in a new tab' : '在新标签页查看图片';
    document.querySelectorAll<HTMLImageElement>('.vp-doc img').forEach(image => {
      if (image.closest('button, [role="button"]')) return;
      image.dataset.docImageLink = '';
      image.setAttribute('role', 'link');
      image.setAttribute('tabindex', '0');
      image.setAttribute('aria-label', image.alt ? `${image.alt} — ${hint}` : hint);
      if (!image.hasAttribute('title')) image.title = hint;
    });
  };

  enhanceImages();
  // Covers initial hydration, client-side navigation, and dynamically loaded images.
  const observer = new MutationObserver(enhanceImages);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'alt', 'lang'],
  });

  document.addEventListener('click', openDocumentImage, true);
  document.addEventListener('auxclick', openDocumentImage, true);
  document.addEventListener('keydown', openDocumentImage, true);

  return () => {
    observer.disconnect();
    document.removeEventListener('click', openDocumentImage, true);
    document.removeEventListener('auxclick', openDocumentImage, true);
    document.removeEventListener('keydown', openDocumentImage, true);
  };
}
