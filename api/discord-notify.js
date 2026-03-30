function truncateText(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported.'
    });
    return;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({
      error: 'MISSING_DISCORD_WEBHOOK_URL',
      message: 'Discord webhook URL is not configured.'
    });
    return;
  }

  const { memo } = req.body || {};
  if (!memo || memo.parent_id) {
    res.status(400).json({
      error: 'INVALID_MEMO',
      message: 'A root memo payload is required.'
    });
    return;
  }

  const lat = toNumber(memo.lat);
  const lng = toNumber(memo.lng);
  const coordsText =
    lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '좌표 없음';

  const contentLines = [
    '새 글이 등록됐습니다.',
    `작성자: ${truncateText(memo.nickname || '이름 없음', 80)}`,
    `내용: ${truncateText(memo.text || '', 1200)}`,
    `좌표: ${coordsText}`,
    `작성 시각: ${memo.created_at || new Date().toISOString()}`
  ];

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: contentLines.join('\n')
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(502).json({
        error: 'DISCORD_WEBHOOK_FAILED',
        message: errorText || `Discord webhook returned ${response.status}.`
      });
      return;
    }

    res.status(200).json({
      ok: true
    });
  } catch (error) {
    res.status(500).json({
      error: 'DISCORD_NOTIFY_FAILED',
      message: error.message || 'Failed to notify Discord.'
    });
  }
}
