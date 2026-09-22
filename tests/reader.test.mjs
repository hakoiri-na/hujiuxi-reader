import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { extractStory, tokenize, collectTerms } from '../src/狐九汐/界面/沉浸阅读/text.ts';

test('only complete gal blocks enter reading and glossary', () => {
  const input = '<details>hidden {外部|不应出现}</details><gal>第一段</gal><UpdateVariable>private</UpdateVariable><GAL>第二段</GAL><gal>未完成';
  assert.equal(extractStory(input), '第一段\n\n第二段');
  assert.deepEqual(collectTerms(extractStory(input)), []);
});
test('annotations within bilingual dialogue do not consume the language separator', () => {
  assert.deepEqual(tokenize('「{絵馬|木牌}です|这是{绘马|祈愿木牌}」'), [{kind:'dialogue',ja:[{kind:'term',text:'絵馬',note:'木牌'},{kind:'text',text:'です'}],zh:[{kind:'text',text:'这是'},{kind:'term',text:'绘马',note:'祈愿木牌'}]}]);
});
test('malformed markers remain literal text and duplicate terms are indexed once', () => {
  assert.deepEqual(tokenize('「没有翻译」{未闭合'), [{kind:'text',text:'「没有翻译」'},{kind:'text',text:'{未闭合'}]);
  assert.equal(collectTerms('{绘马|木牌}{绘马|更新的解释}').length, 1);
  assert.equal(collectTerms('{绘马|木牌}{绘马|更新的解释}')[0].note, '更新的解释');
});
test('loader has block boundaries after preceding HTML and before following HTML', async () => {
  const regex = JSON.parse(await readFile(new URL('../install/gal-reader.json', import.meta.url),'utf8'));
  assert.ok(regex.replaceString.startsWith('\n\n```html\n'));
  assert.ok(regex.replaceString.endsWith('\n```\n\n'));
  const expression = new RegExp(regex.findRegex.slice(1, regex.findRegex.lastIndexOf('/')), 'gi');
  const output = '<details>x</details><gal>hello</gal><details>y</details>'.replace(expression, () => regex.replaceString);
  assert.ok(output.includes('</details>\n\n```html'));
  assert.ok(output.includes('```\n\n<details>'));
});
