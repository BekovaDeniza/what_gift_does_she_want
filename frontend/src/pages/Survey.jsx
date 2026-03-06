import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HOLIDAYS,
  AGE_GROUPS,
  CATEGORIES,
  HOBBIES,
  PRICE_RANGES,
  STYLES,
  EMOTIONS,
  COLORS,
  SIZES,
  WRAPPING,
  BOX_CONTENT,
  BOX_SIZE,
  STEP_LABELS,
} from '../surveyConfig';
import { getRecommendation, getComparisonText } from '../recommendation';
import './Survey.css';

const API = '/api';

function getSteps(answers, hasCode) {
  const steps = ['holiday'];
  if (hasCode) steps.push('name');
  steps.push('age', 'hobbies', 'category', 'price');
  if (answers.category === 'box') {
    steps.push('boxContent', 'boxSize');
  }
  steps.push('style', 'emotion', 'color', 'size', 'wrapping', 'notes', 'specificIdea', 'photos', 'result');
  return steps;
}

export default function Survey() {
  const { code } = useParams();
  const [answers, setAnswers] = useState({
    holiday: '',
    name: '',
    age: '',
    hobbies: [],
    category: '',
    price: '',
    style: '',
    emotion: '',
    color: '',
    size: '',
    wrapping: '',
    boxContent: '',
    boxSize: '',
    notes: '',
    specificIdea: '',
  });
  const [steps, setSteps] = useState(() => getSteps(answers, !!code));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [codeValid, setCodeValid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSteps(getSteps(answers, !!code));
  }, [answers.category, code]);

  useEffect(() => {
    if (!code) {
      setCodeValid(true);
      return;
    }
    let cancelled = false;
    fetch(`${API}/survey/${code}`)
      .then((r) => (cancelled ? null : r.ok))
      .then((ok) => { if (!cancelled) setCodeValid(ok); })
      .catch(() => { if (!cancelled) setCodeValid(false); });
    return () => { cancelled = true; };
  }, [code]);

  const currentStepId = steps[currentIndex];
  const isResultStep = currentStepId === 'result';

  const setAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleHobby = (id) => {
    setAnswers((prev) => {
      const list = prev.hobbies.includes(id)
        ? prev.hobbies.filter((h) => h !== id)
        : [...prev.hobbies, id];
      return { ...prev, hobbies: list };
    });
  };

  const goNext = useCallback(() => {
    if (currentIndex < steps.length - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, steps.length]);

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...photos, ...files].slice(0, 10);
    setPhotos(combined);
    const previews = combined.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((old) => {
      old.forEach((u) => URL.revokeObjectURL(u));
      return previews;
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    const recommendation = getRecommendation(answers);
    if (!code) {
      setSubmitDone(true);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('answers', JSON.stringify(answers));
      formData.append('recommendation', recommendation);
      photos.forEach((file) => {
        formData.append('photos', file);
      });
      await fetch(`${API}/survey/${code}/submit`, {
        method: 'POST',
        body: formData,
      });
      setSubmitDone(true);
    } catch {
      setSubmitDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (code && codeValid === false) {
    return (
      <div className="survey survey--error">
        <div className="survey__card">
          <h1>Ссылка не найдена</h1>
          <p>Возможно, она устарела или указана с ошибкой.</p>
          <Link to="/" className="survey__link">На главную</Link>
        </div>
      </div>
    );
  }

  if (code && codeValid === null) {
    return (
      <div className="survey">
        <div className="survey__card"><p className="survey__loading-text">Загрузка...</p></div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / steps.length) * 100;

  const renderOptions = (list, answerKey, autoAdvance = true) => (
    <div className="survey__options">
      {list.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`survey__option ${answers[answerKey] === item.id ? 'survey__option--active' : ''}`}
          onClick={() => {
            setAnswer(answerKey, item.id);
            if (autoAdvance) setTimeout(goNext, 200);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="survey">
      <div className="survey__bg" aria-hidden />
      <div className="survey__wrap">
        <header className="survey__header">
          <Link to="/" className="survey__back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            На главную
          </Link>
          <div className="survey__progress">
            <div className="survey__progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="survey__step-counter">
            {currentIndex + 1} / {steps.length}
          </p>
        </header>

        <div className="survey__card">
          <h2 className="survey__question">{STEP_LABELS[currentStepId]}</h2>

          {currentStepId === 'holiday' && renderOptions(HOLIDAYS, 'holiday')}
          {currentStepId === 'age' && renderOptions(AGE_GROUPS, 'age')}
          {currentStepId === 'category' && renderOptions(CATEGORIES, 'category')}
          {currentStepId === 'price' && renderOptions(PRICE_RANGES, 'price')}
          {currentStepId === 'style' && renderOptions(STYLES, 'style')}
          {currentStepId === 'emotion' && renderOptions(EMOTIONS, 'emotion')}
          {currentStepId === 'color' && renderOptions(COLORS, 'color')}
          {currentStepId === 'size' && renderOptions(SIZES, 'size')}
          {currentStepId === 'wrapping' && renderOptions(WRAPPING, 'wrapping')}
          {currentStepId === 'boxContent' && renderOptions(BOX_CONTENT, 'boxContent')}
          {currentStepId === 'boxSize' && renderOptions(BOX_SIZE, 'boxSize')}

          {currentStepId === 'name' && (
            <div className="survey__text-step">
              <input
                type="text"
                className="survey__input"
                placeholder="Ваше имя"
                value={answers.name}
                onChange={(e) => setAnswer('name', e.target.value)}
                autoFocus
              />
              <p className="survey__hint">Чтобы мы знали, от кого пришли ответы</p>
              <div className="survey__nav">
                {currentIndex > 0 && (
                  <button type="button" className="survey__btn survey__btn--secondary" onClick={goBack}>Назад</button>
                )}
                <button
                  type="button"
                  className="survey__btn survey__btn--primary"
                  onClick={goNext}
                  disabled={!answers.name.trim()}
                >
                  Далее
                </button>
              </div>
            </div>
          )}

          {currentStepId === 'hobbies' && (
            <div className="survey__multi">
              <div className="survey__options survey__options--multi">
                {HOBBIES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`survey__option survey__option--chip ${answers.hobbies.includes(h.id) ? 'survey__option--active' : ''}`}
                    onClick={() => toggleHobby(h.id)}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
              <div className="survey__nav">
                {currentIndex > 0 && (
                  <button type="button" className="survey__btn survey__btn--secondary" onClick={goBack}>Назад</button>
                )}
                <button type="button" className="survey__btn survey__btn--primary" onClick={goNext}>Далее</button>
              </div>
            </div>
          )}

          {currentStepId === 'notes' && (
            <div className="survey__text-step">
              <textarea
                className="survey__textarea"
                placeholder="Например: не люблю сладкое, хочу что-то для дома, аллергия на определённые компоненты..."
                value={answers.notes}
                onChange={(e) => setAnswer('notes', e.target.value)}
                rows={4}
              />
              <div className="survey__nav">
                <button type="button" className="survey__btn survey__btn--secondary" onClick={goBack}>Назад</button>
                <button type="button" className="survey__btn survey__btn--primary" onClick={goNext}>Далее</button>
              </div>
            </div>
          )}

          {currentStepId === 'specificIdea' && (
            <div className="survey__text-step">
              <input
                type="text"
                className="survey__input"
                placeholder="Например: наушники AirPods, парфюм Chanel, книга..."
                value={answers.specificIdea}
                onChange={(e) => setAnswer('specificIdea', e.target.value)}
              />
              <p className="survey__hint">Оставьте пустым, если пока не определились</p>
              <div className="survey__nav">
                <button type="button" className="survey__btn survey__btn--secondary" onClick={goBack}>Назад</button>
                <button type="button" className="survey__btn survey__btn--primary" onClick={goNext}>Далее</button>
              </div>
            </div>
          )}

          {currentStepId === 'photos' && (
            <div className="survey__text-step">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="survey__file-input"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="survey__upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Выбрать фото
              </button>
              {photoPreviews.length > 0 && (
                <div className="survey__photo-grid">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="survey__photo-item">
                      <img src={src} alt="" />
                      <button
                        type="button"
                        className="survey__photo-remove"
                        onClick={() => removePhoto(i)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="survey__hint">
                {photos.length > 0
                  ? `Прикреплено: ${photos.length} из 10`
                  : 'Можно пропустить этот шаг'}
              </p>
              <div className="survey__nav">
                <button type="button" className="survey__btn survey__btn--secondary" onClick={goBack}>Назад</button>
                <button type="button" className="survey__btn survey__btn--primary" onClick={goNext}>
                  {photos.length > 0 ? 'Далее' : 'Пропустить'}
                </button>
              </div>
            </div>
          )}

          {currentStepId === 'result' && (
            <div className="survey__result">
              {!submitDone ? (
                <>
                  <div className="survey__recommendation">
                    <p className="survey__recommendation-label">Ой, кажется я ошибся... Мои предположения были:</p>
                    <p className="survey__recommendation-text">{getRecommendation(answers)}</p>
                  </div>
                  {answers.specificIdea?.trim() && (
                    <p className="survey__comparison">
                      {getComparisonText(answers.specificIdea, getRecommendation(answers))}
                    </p>
                  )}

                  {code && (
                    <p className="survey__result-hint">
                      После отправки результаты{photos.length > 0 ? ' и фото' : ''} придут в Telegram.
                    </p>
                  )}
                  <button
                    type="button"
                    className="survey__btn survey__btn--primary survey__btn--submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Отправляем...' : code ? 'Отправить результаты' : 'Готово'}
                  </button>
                </>
              ) : (
                <div className="survey__done">
                  <div className="survey__done-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="22" stroke="var(--sage)" strokeWidth="2"/>
                      <path d="M14 25l7 7 13-14" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="survey__done-title">Готово!</p>
                  {code && <p className="survey__done-sub">Результаты{photos.length > 0 ? ' и фото' : ''} отправлены в Telegram.</p>}
                  <Link to="/" className="survey__btn survey__btn--primary">На главную</Link>
                </div>
              )}
            </div>
          )}

          {!isResultStep
            && currentStepId !== 'notes'
            && currentStepId !== 'specificIdea'
            && currentStepId !== 'hobbies'
            && currentStepId !== 'name'
            && currentStepId !== 'photos'
            && currentIndex > 0 && (
            <div className="survey__nav">
              <button type="button" className="survey__btn survey__btn--secondary" onClick={goBack}>
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
