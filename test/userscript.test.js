import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const script = await readFile(new URL('../hacker-news-readability.user.js', import.meta.url), 'utf8');

const markup = `<!doctype html><html><head></head><body><center><table id="hnmain">
  <tbody><tr><td bgcolor="#ff6600"><span class="pagetop">Hacker News</span></td></tr>
  <tr><td></td></tr><tr><td><table class="fatitem"></table>
  <table class="comment-tree"><tbody>
    <tr class="athing"><td class="ind"><img width="0"></td><td class="votelinks"></td><td class="default"><div><span class="comhead">alice</span></div><span class="commtext">A root comment.</span></td></tr>
    <tr class="spacer"><td height="5"></td></tr>
    <tr class="athing"><td class="ind"><img width="80"></td><td class="votelinks"></td><td class="default"><div><span class="comhead">bob</span></div><span class="commtext">A nested comment.</span></td></tr>
  </tbody></table></td></tr></tbody>
</table></center></body></html>`;

function load(saved) {
  const dom = new JSDOM(markup, {
    runScripts: 'outside-only',
    url: 'https://news.ycombinator.com/item?id=1',
  });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {} });
  if (saved) dom.window.localStorage.setItem('hn-readability:settings', JSON.stringify(saved));
  dom.window.eval(script);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}

test('metadata is restricted to Hacker News and needs no privileged APIs', () => {
  assert.match(script, /@match\s+https:\/\/news\.ycombinator\.com\/\*/);
  assert.match(script, /@grant\s+none/);
  assert.doesNotMatch(script, /GM_xmlhttpRequest|GM\.xmlHttpRequest/);
});

test('enhances an item page without replacing native collapse controls', () => {
  const dom = load();
  const { document } = dom.window;
  assert.ok(document.body.classList.contains('hnr-item-page'));
  assert.equal(document.querySelectorAll('.hnr-settings-button').length, 1);
  assert.equal(document.querySelectorAll('.hnr-panel').length, 1);
  assert.equal(document.querySelectorAll('.comment-tree tr.athing')[1].dataset.hnrDepth, '2');
  assert.match(document.querySelector('#hn-readability-styles').textContent, /max-width: var\(--hnr-measure\)/);
  dom.window.close();
});

test('restores valid saved preferences', () => {
  const dom = load({ theme: 'dark', measure: 76, fontSize: 16, density: 'compact' });
  const { document } = dom.window;
  assert.ok(document.documentElement.classList.contains('hnr-dark'));
  assert.ok(document.body.classList.contains('hnr-compact'));
  assert.equal(document.documentElement.style.getPropertyValue('--hnr-measure'), '76ch');
  assert.equal(document.documentElement.style.getPropertyValue('--hnr-font-size'), '16px');
  dom.window.close();
});

test('settings control opens accessibly and persists changes', () => {
  const dom = load();
  const { document, Event } = dom.window;
  const button = document.querySelector('.hnr-settings-button');
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(document.querySelector('.hnr-panel').hidden, false);

  const measure = document.querySelector('input[name="measure"]');
  measure.value = '74';
  measure.dispatchEvent(new Event('input', { bubbles: true }));
  assert.equal(JSON.parse(dom.window.localStorage.getItem('hn-readability:settings')).measure, 74);
  assert.equal(document.documentElement.style.getPropertyValue('--hnr-measure'), '74ch');
  dom.window.close();
});
