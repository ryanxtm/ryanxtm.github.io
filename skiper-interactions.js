/* Native adaptations of Skiper UI 52, 58 and Link001 (40).
 * Original components: https://skiper-ui.com — see vendor/skiper-attribution.txt.
 */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Character layers retain the site's typefaces; duplicate visual text is hidden from AT.
  document.querySelectorAll('.site-header nav a, .site-header .wordmark, footer .wordmark, .intro-directory .directory-heading').forEach(label => {
    label.closest('a')?.classList.add('roll-link');
    [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).forEach(node => {
      const value = node.textContent.trim();
      const root = document.createElement('span');
      root.className = 'text-roll';
      const accessible = document.createElement('span');
      accessible.className = 'sr-only';
      accessible.textContent = value;
      root.append(accessible);
      [0, 1].forEach(layer => {
        const row = document.createElement('span');
        row.className = 'roll-row' + (layer ? ' roll-second' : '');
        row.setAttribute('aria-hidden', 'true');
        [...value].forEach((letter, index, letters) => {
          const char = document.createElement('span');
          char.className = 'roll-char';
          char.textContent = letter === ' ' ? '\u00a0' : letter;
          char.style.setProperty('--roll-delay', `${.035 * Math.abs(index - (letters.length - 1) / 2)}s`);
          row.append(char);
        });
        root.append(row);
      });
      node.replaceWith(root);
    });
  });

  // Link001: an underline drawing from the left and a gently arriving arrow.
  document.querySelectorAll('a[href]:not(.skip-link):not(.site-header nav a):not(.wordmark)').forEach(link => {
    link.classList.add('skiper-link');
    if (getComputedStyle(link).position === 'static') link.classList.add('skiper-positioned');
    const line = document.createElement('span');
    line.className = 'animated-link-line';
    line.setAttribute('aria-hidden', 'true');
    link.append(line);
    [...link.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => {
      const match = node.textContent.match(/^(.*?)([↗↘↓↑→])\s*$/s);
      if (!match) return;
      const arrow = document.createElement('span');
      arrow.textContent = match[2];
      arrow.setAttribute('aria-hidden', 'true');
      node.replaceWith(document.createTextNode(match[1]), arrow);
    });
    const existing = [...link.querySelectorAll('span[aria-hidden="true"]')].find(span => /^[↗↘↓↑→]$/.test(span.textContent.trim()));
    if (existing) existing.classList.add('animated-link-arrow');
    else if (!/[↗↘↓↑→]/.test(link.textContent) && !link.querySelector('svg')) {
      const arrow = document.createElement('span');
      arrow.className = 'animated-link-arrow link-extra-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.append(arrow);
    }
  });

  let lenis;
  function syncMotion() {
    lenis?.destroy();
    lenis = undefined;
    if (reduced.matches || !window.Lenis) return;
    lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      anchors: { offset: -(document.querySelector('.site-header')?.offsetHeight || 0) - 12 },
      prevent: node => node.closest('dialog, [data-lenis-prevent]') !== null,
      stopInertiaOnNavigate: true
    });
    if (document.body.classList.contains('modal-open')) lenis.stop();
  }
  syncMotion();
  reduced.addEventListener('change', syncMotion);
  // Full-size photo viewers use native scroll while the background stays still.
  new MutationObserver(() => {
    if (!lenis) return;
    if (document.body.classList.contains('modal-open')) lenis.stop();
    else lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
