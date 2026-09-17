// ==UserScript==
// @name         Hacker News Readability
// @namespace    https://github.com/
// @version      0.1.0
// @description  A restrained, responsive reading layout for Hacker News.
// @author       Hacker News Readability contributors
// @license      MIT
// @match        https://news.ycombinator.com/*
// @match        http://news.ycombinator.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const STORAGE_KEY = 'hn-readability:settings';
  const DEFAULTS = Object.freeze({
    theme: 'hn',
    measure: 82,
    fontSize: 14,
    density: 'comfortable',
  });

  const readSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        theme: ['hn', 'dark', 'auto'].includes(saved.theme) ? saved.theme : DEFAULTS.theme,
        measure: Math.min(90, Math.max(68, Number(saved.measure) || DEFAULTS.measure)),
        fontSize: Math.min(18, Math.max(13, Number(saved.fontSize) || DEFAULTS.fontSize)),
        density: ['comfortable', 'compact'].includes(saved.density) ? saved.density : DEFAULTS.density,
      };
    } catch {
      return { ...DEFAULTS };
    }
  };

  let settings = readSettings();

  const style = document.createElement('style');
  style.id = 'hn-readability-styles';
  style.textContent = `
    :root {
      --hnr-measure: 82ch;
      --hnr-font-size: 14px;
      --hnr-line-height: 1.55;
      --hnr-thread-gap: 18px;
      --hnr-page: #f6f6ef;
      --hnr-ink: #000;
      --hnr-muted: #828282;
      --hnr-link: #000;
      --hnr-guide: rgba(130, 130, 130, .28);
      --hnr-panel: #fff;
      --hnr-border: #b7b7b0;
      color-scheme: light;
    }

    html.hnr-dark {
      --hnr-page: #181818;
      --hnr-ink: #e6e6e0;
      --hnr-muted: #aaa;
      --hnr-link: #e6e6e0;
      --hnr-guide: rgba(255, 255, 255, .18);
      --hnr-panel: #252525;
      --hnr-border: #555;
      color-scheme: dark;
    }

    body { margin: 0; }
    body > center { display: block; }
    #hnmain {
      width: min(calc(100% - 32px), 1180px) !important;
      min-width: 0 !important;
      background: var(--hnr-page) !important;
    }
    html.hnr-dark body,
    html.hnr-dark #hnmain { background: var(--hnr-page) !important; color: var(--hnr-ink); }
    html.hnr-dark a:link { color: var(--hnr-link); }
    html.hnr-dark a:visited { color: #aaa; }
    html.hnr-dark .subtext,
    html.hnr-dark .subtext a:link,
    html.hnr-dark .comhead,
    html.hnr-dark .comhead a:link,
    html.hnr-dark .hnuser { color: var(--hnr-muted) !important; }

    body.hnr-item-page #hnmain > tbody > tr:nth-child(3) > td {
      padding-inline: clamp(10px, 2.5vw, 34px) !important;
    }
    body.hnr-item-page .fatitem { max-width: var(--hnr-measure); }
    body.hnr-item-page .comment-tree { margin-top: 8px; }
    body.hnr-item-page .comment-tree > tbody > tr.athing > td.default {
      border-left: 1px solid var(--hnr-guide);
      padding-left: 10px;
    }
    body.hnr-item-page .comment-tree > tbody > tr.athing[data-hnr-depth="0"] > td.default {
      border-left-color: transparent;
    }
    body.hnr-item-page .commtext {
      display: block;
      max-width: var(--hnr-measure);
      font-size: var(--hnr-font-size) !important;
      line-height: var(--hnr-line-height) !important;
      color: var(--hnr-ink) !important;
      overflow-wrap: anywhere;
    }
    body.hnr-item-page .commtext p { margin-block: .65em 0; }
    body.hnr-item-page .comhead {
      display: inline-block;
      margin-bottom: 4px;
      font-size: max(11px, calc(var(--hnr-font-size) - 2px)) !important;
      line-height: 1.35;
    }
    body.hnr-item-page .comment-tree > tbody > tr.spacer > td { height: var(--hnr-thread-gap) !important; }
    body.hnr-item-page textarea { width: min(100%, var(--hnr-measure)) !important; max-width: 100%; }
    body.hnr-compact { --hnr-line-height: 1.4; --hnr-thread-gap: 10px; }

    .hnr-settings-button {
      appearance: none;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      margin-left: 7px;
      padding: 1px 4px;
      text-decoration: underline;
    }
    .hnr-settings-button:focus-visible,
    .hnr-panel button:focus-visible,
    .hnr-panel input:focus-visible,
    .hnr-panel select:focus-visible { outline: 2px solid #005fcc; outline-offset: 2px; }
    .hnr-panel[hidden] { display: none; }
    .hnr-panel {
      position: fixed;
      z-index: 10000;
      top: 42px;
      right: max(16px, calc((100vw - 1180px) / 2));
      box-sizing: border-box;
      width: min(330px, calc(100vw - 32px));
      padding: 16px;
      border: 1px solid var(--hnr-border);
      border-radius: 5px;
      background: var(--hnr-panel);
      color: var(--hnr-ink);
      box-shadow: 0 8px 28px rgba(0, 0, 0, .22);
      font: 14px/1.4 Verdana, Geneva, sans-serif;
      text-align: left;
    }
    .hnr-panel h2 { margin: 0 0 12px; font-size: 17px; }
    .hnr-panel label { display: grid; gap: 5px; margin: 12px 0; }
    .hnr-panel output { font-variant-numeric: tabular-nums; }
    .hnr-panel-actions { display: flex; justify-content: space-between; margin-top: 16px; }
    .hnr-panel button { padding: 5px 9px; }

    @media (max-width: 750px) {
      #hnmain { width: 100% !important; }
      body.hnr-item-page #hnmain > tbody > tr:nth-child(3) > td { padding-inline: 8px !important; }
      body.hnr-item-page .comment-tree > tbody > tr.athing > td.ind img { max-width: 12vw; }
      body.hnr-item-page .comment-tree > tbody > tr.athing > td.default { padding-left: 6px; }
      .hnr-panel { top: 36px; right: 8px; }
    }

    @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
  `;

  const appendStyle = () => (document.head || document.documentElement).append(style);
  appendStyle();

  const effectiveTheme = () => {
    if (settings.theme !== 'auto') return settings.theme;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'hn';
  };

  const applySettings = () => {
    const root = document.documentElement;
    root.style.setProperty('--hnr-measure', `${settings.measure}ch`);
    root.style.setProperty('--hnr-font-size', `${settings.fontSize}px`);
    root.classList.toggle('hnr-dark', effectiveTheme() === 'dark');
    document.body?.classList.toggle('hnr-compact', settings.density === 'compact');
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applySettings();
  };

  const markCommentDepths = () => {
    document.querySelectorAll('.comment-tree tr.athing').forEach((row) => {
      const indent = row.querySelector('td.ind img');
      row.dataset.hnrDepth = String(Math.round((Number(indent?.width) || 0) / 40));
    });
  };

  const makePanel = () => {
    const panel = document.createElement('section');
    panel.className = 'hnr-panel';
    panel.id = 'hnr-settings';
    panel.hidden = true;
    panel.setAttribute('aria-labelledby', 'hnr-settings-title');
    panel.innerHTML = `
      <h2 id="hnr-settings-title">Reading settings</h2>
      <label>Theme
        <select name="theme">
          <option value="hn">Hacker News</option>
          <option value="auto">Automatic</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>Comment width: <output name="measure"></output>
        <input name="measure" type="range" min="68" max="90" step="1">
      </label>
      <label>Comment text: <output name="fontSize"></output>
        <input name="fontSize" type="range" min="13" max="18" step="1">
      </label>
      <label>Spacing
        <select name="density">
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </label>
      <div class="hnr-panel-actions">
        <button type="button" data-action="reset">Reset</button>
        <button type="button" data-action="close">Done</button>
      </div>`;

    const syncPanel = () => {
      for (const key of ['theme', 'measure', 'fontSize', 'density']) {
        panel.querySelector(`[name="${key}"]`).value = settings[key];
      }
      panel.querySelector('output[name="measure"]').textContent = `${settings.measure} characters`;
      panel.querySelector('output[name="fontSize"]').textContent = `${settings.fontSize}px`;
    };

    panel.addEventListener('input', (event) => {
      const { name, value } = event.target;
      if (!Object.hasOwn(DEFAULTS, name)) return;
      settings = { ...settings, [name]: ['measure', 'fontSize'].includes(name) ? Number(value) : value };
      saveSettings();
      syncPanel();
    });
    panel.addEventListener('click', (event) => {
      if (event.target.dataset.action === 'reset') {
        settings = { ...DEFAULTS };
        saveSettings();
        syncPanel();
      }
      if (event.target.dataset.action === 'close') panel.hidden = true;
    });
    syncPanel();
    return panel;
  };

  const initialize = () => {
    document.body.classList.toggle('hnr-item-page', location.pathname === '/item');
    applySettings();
    markCommentDepths();

    const pageTop = document.querySelector('.pagetop');
    if (!pageTop) return;
    const panel = makePanel();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hnr-settings-button';
    button.textContent = 'readability';
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) panel.querySelector('select').focus();
    });
    pageTop.append(button);
    document.body.append(panel);
  };

  const colorScheme = matchMedia('(prefers-color-scheme: dark)');
  colorScheme.addEventListener?.('change', () => settings.theme === 'auto' && applySettings());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
