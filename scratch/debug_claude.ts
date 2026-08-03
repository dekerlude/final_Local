import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

const models = [
  "claude-sonnet-4-6",
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
];

async function debug() {
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 100,
          messages: [{ role: "user", content: "Say 'Claude API is working perfectly for LocalLens!' in JSON format: {\"status\":\"ok\"}" }],
        }),
      });

      console.log(`Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Response: ${text}\n`);
    } catch (e) {
      console.error(`Error on model ${model}:`, e);
    }
  }
}

debug();
