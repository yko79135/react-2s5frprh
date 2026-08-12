import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { hymns } from './data/hymns';

function extractDigits(raw) {
  return raw.replace(/[^0-9]/g, '');
}

export default function App() {
  const [input, setInput] = useState('');
  const [activeNumber, setActiveNumber] = useState(null);

  const availableNumbers = useMemo(
    () => Object.keys(hymns).map(Number).sort((a, b) => a - b),
    []
  );

  const hymn = activeNumber != null ? hymns[activeNumber] : null;
  const notFound = activeNumber != null && !hymn;

  function search(rawValue) {
    const digits = extractDigits(rawValue);
    if (!digits) return;
    setActiveNumber(Number(digits));
  }

  function handleSubmit(e) {
    e.preventDefault();
    search(input);
  }

  function goTo(num) {
    setInput(String(num));
    setActiveNumber(num);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>찬송가 가사</h1>
        <p className="subtitle">장 번호를 입력하면 가사를 보여드려요</p>
      </header>

      <form className="search" onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 144"
          aria-label="찬송가 번호"
        />
        <button type="submit">
          <Search size={18} strokeWidth={2.5} />
          찾기
        </button>
      </form>

      {availableNumbers.length > 0 && (
        <nav className="chips" aria-label="등록된 찬송가 목록">
          {availableNumbers.map((num) => (
            <button
              key={num}
              type="button"
              className={`chip ${activeNumber === num ? 'active' : ''}`}
              onClick={() => goTo(num)}
            >
              {num}장
            </button>
          ))}
        </nav>
      )}

      <main className="content">
        {activeNumber == null && (
          <p className="hint">위에 찬송가 번호를 입력하거나 목록에서 골라보세요.</p>
        )}

        {notFound && (
          <div className="not-found">
            <p>{activeNumber}장은 아직 등록되지 않았어요.</p>
            <p className="hint">src/data/hymns.js 에 가사를 추가하면 볼 수 있어요.</p>
          </div>
        )}

        {hymn && (
          <article className="hymn">
            <h2>
              <span className="hymn-number">{activeNumber}장</span>
              {hymn.title}
            </h2>
            <div className="verses">
              {hymn.verses.map((verse, i) => (
                <section className="verse" key={i}>
                  <h3>{i + 1}절</h3>
                  {verse.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </section>
              ))}
              {hymn.chorus && (
                <section className="verse chorus">
                  <h3>후렴</h3>
                  {hymn.chorus.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </section>
              )}
            </div>
          </article>
        )}
      </main>

      <footer className="footer">
        <p>개인 참고용 앱입니다. 정확한 가사와 악보는 정식 찬송가를 확인하세요.</p>
      </footer>
    </div>
  );
}
