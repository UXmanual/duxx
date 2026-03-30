function truncateText(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
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

  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = String(process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!botToken || !chatId) {
    res.status(500).json({
      error: 'MISSING_TELEGRAM_CONFIG',
      message: 'Telegram bot token or chat ID is not configured.'
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
    lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'N/A';

  const messageLines = [
    'New Babble post created.',
    `Author: ${truncateText(memo.nickname || 'Unknown', 80)}`,
    `Text: ${truncateText(memo.text || '', 1200)}`,
    `Coords: ${coordsText}`,
    `Created: ${memo.created_at || new Date().toISOString()}`
  ];

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageLines.join('\n'),
        disable_web_page_preview: true
      })
    });

    const payload = await response.json();

    if (!response.ok || !payload?.ok) {
      console.error('Telegram send failed:', {
        status: response.status,
        description: payload?.description || null
      });
      res.status(502).json({
        error: 'TELEGRAM_SEND_FAILED',
        message: payload?.description || `Telegram API returned ${response.status}.`
      });
      return;
    }

    res.status(200).json({
      ok: true
    });
  } catch (error) {
    res.status(500).json({
      error: 'TELEGRAM_NOTIFY_FAILED',
      message: error.message || 'Failed to notify Telegram.'
    });
  }
}
