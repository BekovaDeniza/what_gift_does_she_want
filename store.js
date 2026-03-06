import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data.json');

function read() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { users: {}, surveys: {}, results: {} };
  }
}

function write(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function addUser(chatId, username, firstName, userId) {
  const data = read();
  data.users[chatId] = {
    username: username ? username.toLowerCase().replace(/^@/, '') : null,
    firstName: firstName || '',
    userId: userId || chatId,
    registeredAt: new Date().toISOString(),
  };
  write(data);
  return data.users[chatId];
}

export function getChatIdByUsername(username) {
  const data = read();
  const input = String(username).trim().replace(/^@/, '');
  const isNumeric = /^\d+$/.test(input);
  for (const [chatId, user] of Object.entries(data.users)) {
    if (isNumeric && (String(user.userId) === input || chatId === input)) return chatId;
    if (!isNumeric && user.username === input.toLowerCase()) return chatId;
  }
  return null;
}

export function createSurvey(telegramChatId) {
  const data = read();
  const code = uuidv4().replace(/-/g, '').slice(0, 12);
  data.surveys[code] = {
    telegramChatId,
    createdAt: new Date().toISOString(),
  };
  write(data);
  return code;
}

const SURVEY_LINK_DAYS = 30;

export function getSurvey(code) {
  const data = read();
  const survey = data.surveys[code];
  if (!survey) return null;
  const created = new Date(survey.createdAt).getTime();
  const now = Date.now();
  if (now - created > SURVEY_LINK_DAYS * 24 * 60 * 60 * 1000) return null;
  return survey;
}

export function saveResult(code, answers, recommendation) {
  const data = read();
  const survey = data.surveys[code];
  if (!survey) return null;
  data.results[code] = {
    answers,
    recommendation,
    completedAt: new Date().toISOString(),
  };
  write(data);
  return survey.telegramChatId;
}

export function getUser(chatId) {
  const data = read();
  return data.users[chatId] || null;
}
