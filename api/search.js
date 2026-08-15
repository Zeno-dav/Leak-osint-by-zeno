const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  const { query, Key } = req.query;

  // 1. API Key Check (Missing Key)
  if (!Key) {
    return res.status(401).json({
      success: false,
      message: "API key missing! To BUY this API, message on WhatsApp: +63 9620658587 or Telegram: @Zeno098",
      buy_contact: "WhatsApp: +63 9620658587",
      telegram: "@Zeno098",
      buy: "@zenosupportox_bot",
      channel: "https://t.me/zenoexploit1",
      developer: "𖦹 𝚉ᴇɴᴏ༆"
    });
  }

  // 2. Load Keys Database
  const dbPath = path.join(process.cwd(), 'keys.json');
  let keysData = {};

  if (fs.existsSync(dbPath)) {
    try {
      keysData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      return res.status(500).json({ success: false, message: "Error reading database." });
    }
  }

  // 3. Validate API Key (Invalid Key)
  const userRecord = keysData[Key];
  if (!userRecord) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key! To BUY a valid API, message on WhatsApp: +63 9620658587 or Telegram: @Zeno098",
      buy_contact: "WhatsApp: +63 9620658587",
      telegram: "@Zeno098",
      buy: "@zenosupportox_bot",
      channel: "https://t.me/zenoexploit1",
      developer: "𖦹 𝚉ᴇɴᴏ༆"
    });
  }

  // 4. AUTOMATIC EXPIRY DATE CALCULATION
  const startDate = new Date(userRecord.startDate);
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + userRecord.days);

  const currentTime = new Date();
  if (currentTime > expiryDate) {
    return res.status(403).json({
      success: false,
      message: `This API expired on ${expiryDate.toDateString()}! To RENEW or BUY, message on WhatsApp: +63 9620658587`,
      buy_contact: "WhatsApp: +63 9620658587",
      telegram: "@Zeno098",
      buy: "@zenosupportox_bot",
      channel: "https://t.me/zenoexploit1",
      developer: "𖦹 𝚉ᴇɴᴏ༆"
    });
  }

  // 5. DAILY LIMIT CHECK
  const todayStr = currentTime.toISOString().split('T')[0];
  const dailyLimit = userRecord.dailyLimit || 100;

  if (!userRecord.usage || userRecord.usage.date !== todayStr) {
    userRecord.usage = { date: todayStr, count: 0 };
  }

  if (userRecord.usage.count >= dailyLimit) {
    return res.status(429).json({
      success: false,
      message: `Daily limit reached! Your limit is ${dailyLimit} requests/day.`,
      daily_limit: dailyLimit,
      used_today: userRecord.usage.count,
      buy_contact: "WhatsApp: +63 9620658587",
      buy: "@zenosupportox_bot",
      channel: "https://t.me/zenoexploit1",
      developer: "𖦹 𝚉ᴇɴᴏ༆"
    });
  }

  // 6. Check query parameter
  if (!query) {
    return res.status(400).json({
      success: false,
      message: "query parameter missing. Please provide a valid number."
    });
  }

  try {
    // 7. Upstream API Fetch
    const response = await fetch(
      `https://leak-osint.noob73613.workers.dev/?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: "Upstream API error" });
    }

    const upstreamData = await response.json();

    // 8. Replace Logic
    let responseString = JSON.stringify(upstreamData);
    responseString = responseString
      .replace(/https:\/\/t\.me\/noobsterrr/gi, 'https://t.me/zenoexploit1') 
      .replace(/NOOB\$TER/gi, '𖦹 𝚉ᴇɴᴏ༆') 
      .replace(/@nooobsterbot/gi, '@zenosupportox_bot') 
      .replace(/noobster/gi, 'zeno'); 

    const modifiedUpstreamData = JSON.parse(responseString);

    // 9. Final Output
    const cleanResponse = {
      ...modifiedUpstreamData, 
      api_user: userRecord.name,
      usage: {
        limit: dailyLimit,
        used_today: userRecord.usage.count + 1,
        remaining: dailyLimit - (userRecord.usage.count + 1)
      },
      developer: "𖦹 𝚉ᴇɴᴏ༆",
      buy: "@zenosupportox_bot",
      channel: "https://t.me/zenoexploit1",
      bought_from: "WhatsApp: +63 9620658587"
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(cleanResponse, null, 2));

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
