import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CreateLink.css';

const API = '/api';

export default function CreateLink() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLink('');
    const value = username.trim();
    if (!value) {
      setError('Введите ваш Telegram (логин)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_username: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Не удалось создать ссылку');
        return;
      }
      setLink(data.link || '');
    } catch {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="create-link">
      <div className="create-link__bg" aria-hidden />
      <header className="create-link__header">
        <Link to="/" className="create-link__back">← На главную</Link>
        <h1 className="create-link__title">Получить ссылку на опрос</h1>
        <p className="create-link__subtitle">
          Введите ваш Telegram. Ссылку отправьте тому, кому хотите подарить. После прохождения опроса результаты придут вам в бот.
        </p>
      </header>
      <div className="create-link__card">
        <form onSubmit={handleSubmit} className="create-link__form">
          <label className="create-link__label">
            Telegram (логин или ID)
          </label>
          <input
            type="text"
            className="create-link__input"
            placeholder="@username или числовой ID из бота"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
          {error && <p className="create-link__error">{error}</p>}
          <button type="submit" className="create-link__btn" disabled={loading}>
            {loading ? 'Создаём...' : 'Получить ссылку'}
          </button>
        </form>
        {link && (
          <div className="create-link__result">
            <p className="create-link__result-label">Ваша ссылка:</p>
            <div className="create-link__result-row">
              <input readOnly value={link} className="create-link__result-input" />
              <button type="button" className="create-link__btn create-link__btn--copy" onClick={copyLink}>
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
            <p className="create-link__result-hint">Отправьте её тому, кому хотите подарить</p>
          </div>
        )}
      </div>
    </div>
  );
}
