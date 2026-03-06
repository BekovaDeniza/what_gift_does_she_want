import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addUser,
  getChatIdByUsername,
  createSurvey,
  getSurvey,
  saveResult,
  getUser,
} from './store.js';
import { formatSurveyMessage } from './formatter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const token = process.env.TELEGRAM_BOT_TOKEN;
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

if (!token) {
  console.warn('TELEGRAM_BOT_TOKEN не задан.');
}

const bot = token ? new TelegramBot(token, { polling: true }) : null;

if (bot) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username || null;
    const firstName = msg.from?.first_name || '';
    const userId = msg.from?.id;
    addUser(chatId, username, firstName, userId);
    const u = username ? ` (@${username})` : ` — или ваш ID: ${userId}`;
    bot.sendMessage(
      chatId,
      `Привет${firstName ? ', ' + firstName : ''}!\n\n` +
        `Я бот сервиса «Подарок мечты». Чтобы получить ссылку на опрос:\n\n` +
        `1. Зайдите на сайт\n` +
        `2. Выберите «Узнать, что хочет другой»\n` +
        `3. Введите ваш Telegram${u}\n\n` +
        `После прохождения опроса результаты придут сюда.`
    );
  });
}

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(null, false);
  },
});

const distPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(distPath));

app.get('/api/survey/:code', (req, res) => {
  const survey = getSurvey(req.params.code);
  if (!survey) return res.status(404).json({ error: 'Ссылка не найдена или устарела' });
  res.json({ ok: true });
});

app.post('/api/link', (req, res) => {
  const { telegram_username } = req.body || {};
  if (!telegram_username || typeof telegram_username !== 'string') {
    return res.status(400).json({ error: 'Укажите Telegram (логин)' });
  }
  const chatId = getChatIdByUsername(telegram_username.trim());
  if (!chatId) {
    return res.status(404).json({
      error: 'Пользователь не найден. Сначала напишите боту в Telegram команду /start',
    });
  }
  const code = createSurvey(chatId);
  const baseUrl = req.protocol + '://' + req.get('host');
  const link = `${baseUrl}/s/${code}`;
  res.json({ link, code });
});

app.post('/api/survey/:code/submit', upload.array('photos', 10), async (req, res) => {
  const { code } = req.params;
  const survey = getSurvey(code);
  if (!survey) return res.status(404).json({ error: 'Ссылка не найдена' });

  let answers, recommendation;
  try {
    answers = JSON.parse(req.body.answers || '{}');
    recommendation = req.body.recommendation || '';
  } catch {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const chatId = saveResult(code, answers, recommendation || null);
  if (!chatId || !bot) {
    cleanupFiles(req.files);
    return res.json({ ok: true, message: 'Результаты сохранены' });
  }

  const text = formatSurveyMessage(answers, recommendation);
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });

    const files = req.files || [];
    if (files.length > 0) {
      const caption = answers.name
        ? `Фото от ${answers.name} (${files.length})`
        : `Прикреплённые фото (${files.length})`;
      if (files.length === 1) {
        await bot.sendPhoto(chatId, fs.createReadStream(files[0].path), {
          caption,
        });
      } else {
        const media = files.slice(0, 10).map((f, i) => ({
          type: 'photo',
          media: fs.createReadStream(f.path),
          ...(i === 0 ? { caption } : {}),
        }));
        await bot.sendMediaGroup(chatId, media);
      }
    }
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }

  cleanupFiles(req.files);
  res.json({ ok: true });
});

function cleanupFiles(files) {
  if (!files) return;
  for (const f of files) {
    fs.unlink(f.path, () => {});
  }
}

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`);
  if (bot) console.log('Telegram бот запущен.');
});
