const titles = [
  '初春瑞雪',
  '梅影浮香',
  '樱信初至',
  '花雨满庭',
  '薰风入弦',
  '紫阳听雨',
  '星河笺语',
  '海风寄夏',
  '月照桂庭',
  '红叶题诗',
  '霜枫晚照',
  '岁暮听雪',
];
const months = ['睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'];
const weekdays: Record<string, string> = { 月: '一', 火: '二', 水: '三', 木: '四', 金: '五', 土: '六', 日: '日' };
export function calendarLabels(date: string, weekday: string, time: string) {
  const match = date.match(/^(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})日?$/);
  const parsed = match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : null;
  const valid = !!(
    match &&
    parsed &&
    parsed.getUTCFullYear() === +match[1] &&
    parsed.getUTCMonth() === +match[2] - 1 &&
    parsed.getUTCDate() === +match[3]
  );
  const day = weekdays[weekday]
    ? weekday
    : parsed && valid
      ? ['日', '月', '火', '水', '木', '金', '土'][parsed.getUTCDay()]
      : '';
  const chineseWeek = day ? `星期${weekdays[day]}` : '星期待定';
  const japaneseWeek = day ? `${day}曜日` : '曜日未定';
  let japaneseDate = date;
  if (valid && parsed) {
    const parts = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
      era: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).formatToParts(parsed);
    const era = parts.find(p => p.type === 'era')?.value ?? '';
    const year = parts.find(p => p.type === 'year')?.value ?? '';
    japaneseDate = `${era}${year}年 ${months[parsed.getUTCMonth()]}${parsed.getUTCDate()}日`;
  }
  return {
    title: valid && parsed ? titles[parsed.getUTCMonth()] : '四时清笺',
    header: `${date} · ${chineseWeek} · ${time}`,
    japanese: `${japaneseDate} · ${japaneseWeek} · ${time}`,
  };
}
