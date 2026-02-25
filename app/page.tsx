'use client'

import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'

const STORAGE_WAGE = 'zastavma_hourly_wage'
const STORAGE_SAVED = 'zastavma_total_saved'

function getSarkasmus(hours: number): string {
  if (hours < 1) return 'To si zaslúžiš, kúp si to. Si lacný.';
  if (hours < 7) return `To je skoro celý deň v robote. Fakt to potrebuješ?`;
  if (hours < 11.9) return 'To je celý deň v robote. Fakt to potrebuješ?';
  if (hours < 15.9) return 'Jeden a pol dňa v tej klietke za toto? Nerob to.';
  if (hours < 39.9) return 'Dva celé dni života spláchnuté do záchoda. Si si istý?';
  if (hours >= 40) return 'Celý pracovný týždeň za toto? Si sa zbláznil?';
  return 'To je kus tvojej slobody. Radšej to zavri.'
}

function fireConfetti() {
  const count = 120
  const defaults = { origin: { y: 0.7 }, colors: ['#ffff00', '#ffeb3b', '#fff59d', '#fffde7'] }
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
  }
  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

export default function ZastavmaPage() {
  const [wage, setWage] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [totalSaved, setTotalSaved] = useState<number>(0)
  const [savedMessage, setSavedMessage] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcMzda, setCalcMzda] = useState<string>('')
  const [calcHours, setCalcHours] = useState<string>('')
  const [urciteMessage, setUrciteMessage] = useState(false)

  useEffect(() => {
    const w = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_WAGE) : null
    const s = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SAVED) : null
    if (w) setWage(w)
    if (s) setTotalSaved(parseFloat(s) || 0)
  }, [])

  const wageNum = parseFloat(wage.replace(',', '.')) || 0
  const priceNum = parseFloat(price.replace(',', '.')) || 0
  const hours = wageNum > 0 ? priceNum / wageNum : 0
  const hasResult = priceNum > 0 && wageNum > 0
  const zeroWageCase = priceNum > 0 && wageNum === 0
  const wageIs898 = Math.abs(wageNum - 8.98) < 0.01

  const handleWageBlur = () => {
    if (typeof window !== 'undefined' && wage.trim()) {
      localStorage.setItem(STORAGE_WAGE, wage.trim())
    }
  }

  const handleCalcSubmit = () => {
    const m = parseFloat(calcMzda.replace(',', '.')) || 0
    const h = parseFloat(calcHours.replace(',', '.')) || 0
    if (m > 0 && h > 0) {
      const hourly = m / h
      setWage(hourly.toFixed(2))
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_WAGE, String(hourly.toFixed(2)))
      }
      setShowCalculator(false)
      setCalcMzda('')
      setCalcHours('')
    }
  }

  const handleSavedClick = () => {
    if (!hasResult || priceNum <= 0) return
    fireConfetti()
    const newTotal = totalSaved + priceNum
    setTotalSaved(newTotal)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SAVED, String(newTotal))
    }
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 4000)
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Zastav Ma!</h1>

      <div style={styles.section}>
        <label style={styles.label}>Približná čistá hodinová mzda</label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="napr. 12"
          value={wage}
          onChange={(e) => setWage(e.target.value)}
          onBlur={handleWageBlur}
          style={styles.input}
        />
        <button
          type="button"
          onClick={() => setShowCalculator((v) => !v)}
          style={styles.neviemBtn}
        >
          Neviem
        </button>
        {showCalculator && (
          <div style={styles.calcBox}>
            <label style={styles.label}>Čistá mzda (EUR)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="napr. 1200"
              value={calcMzda}
              onChange={(e) => setCalcMzda(e.target.value)}
              style={styles.input}
            />
            <label style={styles.label}>Počet odpracovaných hodín</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="napr. 160"
              value={calcHours}
              onChange={(e) => setCalcHours(e.target.value)}
              style={styles.input}
            />
            <button type="button" onClick={handleCalcSubmit} style={styles.calcSubmitBtn}>
              Vypočítaj
            </button>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Koľko stojí tá blbosť, čo si chceš kúpiť?</label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="suma v EUR"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.inputBig}
        />
      </div>

      {(hasResult || zeroWageCase) && (
        <>
          <p style={styles.result}>
            Tento nákup ťa stojí <span style={styles.hours}>{hasResult ? hours.toFixed(1) : '?'}</span> hodín v práci
          </p>
          {hasResult && <p style={styles.sarkasmus}>{getSarkasmus(hours)}</p>}

          {zeroWageCase ? (
            <>
              <button
                type="button"
                onClick={() => setUrciteMessage(true)}
                style={styles.saveBtn}
              >
                Určite?
              </button>
              {urciteMessage && (
                <p style={styles.savedMessage}>
                  Čo Štefi nevidí, to srdce nebolí
                </p>
              )}
            </>
          ) : (
            <>
              {wageIs898 ? (
                <button type="button" style={styles.saveBtn}>
                  NIKDA!
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSavedClick}
                  style={styles.saveBtn}
                >
                  UŠETRIL SOM TO!
                </button>
              )}

              {savedMessage && (
                <p style={styles.savedMessage}>
                  Dobrá práca! Tvoje budúce ja ti ďakuje.
                </p>
              )}

              {totalSaved > 0 && !savedMessage && (
                <p style={styles.totalSaved}>
                  Celkovo ušetrené: <span style={styles.accent}>{totalSaved.toFixed(2)} €</span>
                </p>
              )}
            </>
          )}
        </>
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '2rem',
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    color: '#ffff00',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '420px',
  },
  label: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.85)',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    fontSize: '1.25rem',
    background: '#111',
    border: '3px solid #333',
    color: '#fff',
    outline: 'none',
  },
  inputBig: {
    width: '100%',
    padding: '1.25rem 1.5rem',
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    background: '#111',
    border: '3px solid #333',
    color: '#fff',
    outline: 'none',
  },
  result: {
    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
    textAlign: 'center',
    lineHeight: 1.2,
    marginTop: '1rem',
  },
  hours: {
    color: '#ffff00',
    fontSize: '1.15em',
  },
  sarkasmus: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: '1.5rem',
    padding: '1.25rem 2.5rem',
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    background: '#ffff00',
    color: '#000',
    border: 'none',
    letterSpacing: '0.05em',
  },
  savedMessage: {
    color: '#ffff00',
    fontSize: '1.1rem',
    fontWeight: 800,
  },
  totalSaved: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
  },
  accent: {
    color: '#ffff00',
  },
  neviemBtn: {
    marginTop: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    border: '2px solid #333',
  },
  calcBox: {
    width: '100%',
    marginTop: '1rem',
    padding: '1rem',
    border: '2px solid #333',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  calcSubmitBtn: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    fontSize: '1rem',
    background: '#ffff00',
    color: '#000',
    border: 'none',
  },
}
