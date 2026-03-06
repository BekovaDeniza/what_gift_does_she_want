import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <div className="home__bg" aria-hidden />
      <header className="home__header">
        <h1 className="home__title">Подарок мечты</h1>
        <p className="home__subtitle">Поможем понять, что подарить — или что хочется получить</p>
      </header>
      <nav className="home__cards">
        <Link to="/survey" className="home__card home__card--receive">
          <span className="home__card-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="14" width="24" height="14" rx="3" stroke="var(--sage)" strokeWidth="1.5"/>
              <path d="M16 14v14M4 18h24" stroke="var(--sage)" strokeWidth="1.5"/>
              <path d="M16 14c-3-6-10-6-8-1s8 1 8 1" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 14c3-6 10-6 8-1s-8 1-8 1" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <h2>Хочу получить подарок</h2>
          <p>Пройдите опрос — мы подскажем идеи и сформируем пожелания для того, кто будет дарить</p>
        </Link>
        <Link to="/link" className="home__card home__card--give">
          <span className="home__card-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M20 16a4 4 0 1 0-8 0" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 12V6" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="12" stroke="var(--rose)" strokeWidth="1.5"/>
              <path d="M16 20v2M12 18l-2 2M20 18l2 2" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <h2>Узнать, что хочет другой</h2>
          <p>Получите ссылку на опрос и отправьте близкому человеку. Результаты придут вам в Telegram</p>
        </Link>
      </nav>
      <footer className="home__footer">
        <p>Напишите боту в Telegram команду /start — так вы сможете получать результаты опросов</p>
      </footer>
    </div>
  );
}
