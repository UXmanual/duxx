function truncateText(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildMessageLines(memo) {
  const lat = toNumber(memo.lat);
  const lng = toNumber(memo.lng);
  const coordsText =
    lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'N/A';

  return [
    'New Babble post created.',
    `Author: ${truncateText(memo.nickname || 'Unknown', 80)}`,
    `Text: ${truncateText(memo.text || '', 1200)}`,
    `Coords: ${coordsText}`,
    `Created: ${memo.created_at || new Date().toISOString()}`
  ];
}

async function notifyDiscord(memo) {
  const webhookUrl = String(process.env.DISCORD_WEBHOOK_URL || '').trim();
  if (!webhookUrl) {
    return { channel: 'discord', ok: false, error: 'MISSING_DISCORD_WEBHOOK_URL' };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: buildMessageLines(memo).join('\n')
    })
  });

  if (!response.ok) {
    return {
      channel: 'discord',
      ok: false,
      error: await response.text()
    };
  }

  return { channel: 'discord', ok: true };
}

async function notifyTelegram(memo) {
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = String(process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!botToken || !chatId) {
    return { channel: 'telegram', ok: false, error: 'MISSING_TELEGRAM_CONFIG' };
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessageLines(memo).join('\n'),
      disable_web_page_preview: true
    })
  });

  const payload = await response.json();

  if (!response.ok || !payload?.ok) {
    return {
      channel: 'telegram',
      ok: false,
      error: payload?.description || `Telegram API returned ${response.status}.`
    };
  }

  return { channel: 'telegram', ok: true };
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

  const { memo } = req.body || {};
  if (!memo || memo.parent_id) {
    res.status(400).json({
      error: 'INVALID_MEMO',
      message: 'A root memo payload is required.'
    });
    return;
  }

  const results = await Promise.allSettled([notifyDiscord(memo), notifyTelegram(memo)]);
  const normalizedResults = results.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : {
          channel: 'unknown',
          ok: false,
          error: result.reason?.message || 'Notification failed unexpectedly.'
        }
  );

  const hasSuccess = normalizedResults.some((result) => result.ok);

  if (!hasSuccess) {
    console.error('Memo notify failed for all channels:', normalizedResults);
    res.status(502).json({
      error: 'MEMO_NOTIFY_FAILED',
      results: normalizedResults
    });
    return;
  }

  const failures = normalizedResults.filter((result) => !result.ok);
  if (failures.length > 0) {
    console.error('Memo notify partial failure:', failures);
  }

  res.status(200).json({
    ok: true,
    results: normalizedResults
  });
}
