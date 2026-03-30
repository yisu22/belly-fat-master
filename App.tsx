import { useCallback, useEffect, useMemo, useState } from 'react';
import { CircularProgress } from './CircularProgress';
import { ExerciseIllustration, getExerciseGuide } from './ExerciseIllustration';
import { Toast } from './Toast';
import { WeightBars } from './WeightBars';
import { DAYS, routineData } from './routineData';
import type { LocationMode, ProfileState, ProgressState, WeightEntry } from './types';
import { getLocalDateKey, getTodayDayIndex, getWeekFromStartDate } from './date';
import { calculateBMI, getBmiBadgeStyle, getBmiInfo, getMotivationMessage, sanitizeDecimalInput } from './health';
import {
  getDayOverallProgress,
  getDayProgressForMode,
  getModeKey,
  getPreferredModeForDay,
  getRoutineList,
  getStageKey,
  getTaskStorageKey,
} from './routine';
import { readStoredJson, writeStoredJson } from './storage';

/* ── Storage keys ──────────────────────────── */
const K_PROGRESS  = 'bfm8-progress';
const K_PROFILE   = 'bfm8-profile';
const K_WEIGHTS   = 'bfm8-weights';
const K_STARTDATE = 'bfm8-startdate';
const K_MODE      = 'bfm8-mode';

type TabKey = 'home' | 'workout' | 'progress' | 'settings';
type ToastState = { msg: string; type: 'success' | 'error' } | null;

function getStageNum(week: number) { return week <= 4 ? 1 : week <= 8 ? 2 : 3; }
function getStageLabel(sn: number) {
  return sn === 1 ? '기초 형성' : sn === 2 ? '강도 상승' : '마지막 박차';
}

/* ── Category chip ─────────────────────────── */
function ExCat({ name }: { name: string }) {
  if (name.includes('걷기') || name.includes('러닝') || name.includes('자전거') || name.includes('로잉'))
    return <span className="ex-cat ex-cat--cardio">유산소</span>;
  if (name.includes('플랭크') || name.includes('크런치') || name.includes('마운틴') || name.includes('탭'))
    return <span className="ex-cat ex-cat--core">코어</span>;
  if (name.includes('스쿼트') || name.includes('런지') || name.includes('레그') || name.includes('스텝') ||
      name.includes('데드') || name.includes('힙'))
    return <span className="ex-cat ex-cat--lower">하체</span>;
  if (name.includes('스트레칭') || name.includes('휴식') || name.includes('산책'))
    return <span className="ex-cat ex-cat--recovery">회복</span>;
  if (name.includes('푸쉬업') || name.includes('체스트') || name.includes('숄더') || name.includes('딥스') ||
      name.includes('레이즈') || name.includes('물통'))
    return <span className="ex-cat ex-cat--push">상체밀기</span>;
  return <span className="ex-cat ex-cat--pull">상체당기기</span>;
}

/* ════════════════════════════════════════════
   HOME TAB
════════════════════════════════════════════ */
function HomeTab({
  week, day, mode, progressState, weightHistory, profile, startDate, onNavigate,
}: {
  week: number; day: number; mode: LocationMode;
  progressState: ProgressState; weightHistory: WeightEntry[];
  profile: ProfileState; startDate: string | null;
  onNavigate: (t: TabKey) => void;
}) {
  const sk = getStageKey(week);
  const sn = getStageNum(week);
  const dayData = routineData[sk][day];
  const isSingle = Boolean(dayData.single);
  const tasks = getRoutineList(sk, day, mode);
  const mk = getModeKey(dayData, mode);
  const cm = progressState[`w${week}`]?.[`d${day}_${mk}`] ?? {};
  const doneCount = tasks.filter((t) => cm[getTaskStorageKey(t)]).length;
  const todayPct = getDayOverallProgress(progressState, week, day);

  const weeklyPct = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 7; i++) total += getDayOverallProgress(progressState, week, i);
    return Math.round(total / 7);
  }, [week, progressState]);

  const latestW = weightHistory.length ? weightHistory[weightHistory.length - 1].weight : null;
  const startW  = Number(profile.startWeightKg) || null;
  const h       = Number(profile.heightCm) || 0;
  const waist   = Number(profile.waistCm) || 0;
  const bmi     = latestW && h ? calculateBMI(h, latestW) : 0;
  const bmiInfo = getBmiInfo(bmi);
  const bmiStyle = getBmiBadgeStyle(bmiInfo.badge);
  const delta   = startW && latestW ? +(latestW - startW).toFixed(1) : null;
  const whtr    = waist && h ? waist / h : 0;

  const motivMsg = !startDate
    ? '설정 탭에서 시작일을 입력하면 주차가 자동 계산됩니다.'
    : getMotivationMessage(bmi, whtr, delta);

  return (
    <div className="space-y">
      {/* Hero */}
      <div className="banner">
        <div className="banner__top">
          <div>
            <div className="banner__stage">Stage {sn} · {getStageLabel(sn)}</div>
            <div className="banner__week">{week}주차 · {DAYS[day]}요일</div>
            <div className="banner__mode">
              {isSingle ? '🌿 회복·유산소' : mode === 'gym' ? '🏋️ 헬스장 루틴' : '🏠 홈트 루틴'}
            </div>
          </div>
          <CircularProgress percent={todayPct} size={72} strokeWidth={7} />
        </div>
        <div className="banner__bar-section">
          <div className="banner__bar-row"><span>전체 진행</span><span>{week} / 12주</span></div>
          <div className="banner__bar-bg">
            <div className="banner__bar-fill" style={{ width: `${(week / 12) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="motivation">
        <span className="motivation__icon">💡</span>
        <p className="motivation__text">{motivMsg}</p>
      </div>

      {/* Today preview */}
      <div className="card">
        <div className="row-between" style={{ marginBottom: 12 }}>
          <h3 className="card__title" style={{ margin: 0 }}>오늘의 운동</h3>
          <button className="btn btn-sm-indigo" onClick={() => onNavigate('workout')}>
            운동 시작 →
          </button>
        </div>
        {tasks.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>오늘은 운동이 없습니다.</p>
        ) : (
          <div className="space-y" style={{ gap: 8 }}>
            {tasks.slice(0, 4).map((t, i) => {
              const done = Boolean(cm[getTaskStorageKey(t)]);
              return (
                <div key={i} className="workout-preview-item">
                  <div className={`check-circle ${done ? 'done' : 'undone'}`}>✓</div>
                  <span className={`preview-name ${done ? 'done' : ''}`}>{t.name}</span>
                  <span className="preview-sets">{t.sets}</span>
                </div>
              );
            })}
            {tasks.length > 4 && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', paddingLeft: 30 }}>
                +{tasks.length - 4}개 더
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card__val" style={{ color: 'var(--primary)' }}>{weeklyPct}%</div>
          <div className="stat-card__label">주간 달성</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__val" style={{ color: 'var(--text-1)' }}>
            {latestW ?? '–'}
          </div>
          <div className="stat-card__label">현재 체중 kg</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__val" style={{
            color: delta == null ? 'var(--text-3)' : delta < 0 ? 'var(--success)' : delta > 0 ? 'var(--danger)' : 'var(--text-1)',
          }}>
            {delta == null ? '–' : `${delta > 0 ? '+' : ''}${delta}`}
          </div>
          <div className="stat-card__label">시작 대비 kg</div>
        </div>
      </div>

      {/* BMI */}
      {bmi > 0 && (
        <div className="card">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h3 className="card__title" style={{ margin: 0 }}>BMI</h3>
            <span className="bmi-badge" style={bmiStyle}>{bmiInfo.label}</span>
          </div>
          <div className="bmi-value">{bmi.toFixed(1)}</div>
          <div className="bmi-bar-wrap">
            <div className="bmi-bar-thumb" style={{ left: `${bmiInfo.pos}%` }} />
          </div>
          <div className="bmi-scale">
            <span>저체중 ‹18.5</span><span>정상 23</span><span>25› 비만</span>
          </div>
        </div>
      )}

      {/* Weight chart */}
      {weightHistory.length > 0 && (
        <div className="card">
          <h3 className="card__title">최근 체중 변화</h3>
          <WeightBars entries={weightHistory.slice(-7)} />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   WORKOUT TAB
════════════════════════════════════════════ */
function WorkoutTab({
  week, setWeek, day, setDay, mode, setMode, progressState, setProgressState,
}: {
  week: number; setWeek: (w: number) => void;
  day: number; setDay: (d: number) => void;
  mode: LocationMode; setMode: (m: LocationMode) => void;
  progressState: ProgressState;
  setProgressState: React.Dispatch<React.SetStateAction<ProgressState>>;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const sk = getStageKey(week);
  const dayData = routineData[sk][day];
  const isSingle = Boolean(dayData.single);
  const tasks = getRoutineList(sk, day, mode);
  const mk = getModeKey(dayData, mode);
  const wKey = `w${week}`;
  const dKey = `d${day}_${mk}`;
  const cm = progressState[wKey]?.[dKey] ?? {};
  const doneCount = tasks.filter((t) => cm[getTaskStorageKey(t)]).length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const allDone = doneCount === tasks.length && tasks.length > 0;

  const toggleTask = useCallback((idx: number) => {
    const task = tasks[idx];
    const k = getTaskStorageKey(task);
    setProgressState((prev) => {
      const wk = { ...(prev[wKey] ?? {}) };
      const dk = { ...(wk[dKey] ?? {}) };
      dk[k] = !dk[k];
      return { ...prev, [wKey]: { ...wk, [dKey]: dk } };
    });
  }, [tasks, wKey, dKey, setProgressState]);

  function completeAll() {
    setProgressState((prev) => {
      const wk = { ...(prev[wKey] ?? {}) };
      const dk: Record<string, boolean> = {};
      tasks.forEach((t) => { dk[getTaskStorageKey(t)] = true; });
      return { ...prev, [wKey]: { ...wk, [dKey]: dk } };
    });
  }
  function clearDay() {
    setProgressState((prev) => {
      const wk = { ...(prev[wKey] ?? {}) };
      return { ...prev, [wKey]: { ...wk, [dKey]: {} } };
    });
  }

  const sn = getStageNum(week);

  return (
    <div className="space-y">
      {/* Week navigator */}
      <div className="card">
        <div className="week-nav">
          <button className="week-nav__arrow"
            onClick={() => { setWeek(Math.max(1, week - 1)); setExpanded(null); }}>‹</button>
          <div className="week-nav__center">
            <div className="week-nav__num">{week}주차</div>
            <div className="week-nav__stage">Stage {sn} · {getStageLabel(sn)}</div>
          </div>
          <button className="week-nav__arrow"
            onClick={() => { setWeek(Math.min(12, week + 1)); setExpanded(null); }}>›</button>
        </div>
        <div className="week-dots">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
            <div key={w}
              className={`week-dot ${w < week ? 'past' : w === week ? 'current' : 'future'}`}
              onClick={() => { setWeek(w); setExpanded(null); }}
            />
          ))}
        </div>
      </div>

      {/* Day strip */}
      <div className="day-strip">
        {DAYS.map((d, i) => {
          const dp = getDayOverallProgress(progressState, week, i);
          return (
            <button key={i}
              className={`day-btn ${day === i ? 'active' : ''}`}
              onClick={() => { setDay(i); setExpanded(null); }}>
              <span>{d}</span>
              {dp === 100
                ? <span className="day-btn__tick">✓</span>
                : dp > 0
                ? <div className="day-btn__dot" style={{ background: day === i ? 'rgba(255,255,255,0.5)' : 'var(--primary)' }} />
                : <div style={{ height: 5 }} />}
            </button>
          );
        })}
      </div>

      {/* Mode toggle */}
      {!isSingle && (
        <div className="toggle-group">
          <button className={`toggle-btn ${mode === 'gym' ? 'active' : ''}`} onClick={() => setMode('gym')}>
            🏋️ 헬스장
          </button>
          <button className={`toggle-btn ${mode === 'home' ? 'active' : ''}`} onClick={() => setMode('home')}>
            🏠 홈트
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="card">
        <div className="prog-bar-row">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
            진행 {doneCount}/{tasks.length}
          </span>
          <div className="row-gap">
            {!allDone && tasks.length > 0 && (
              <button className="btn btn-sm-indigo" onClick={completeAll}>전체완료</button>
            )}
            {doneCount > 0 && (
              <button className="btn btn-sm-gray" onClick={clearDay}>초기화</button>
            )}
          </div>
        </div>
        <div className="prog-bar-bg">
          <div className={`prog-bar-fill ${allDone ? 'success' : 'indigo'}`} style={{ width: `${pct}%` }} />
        </div>
        {allDone && <div className="prog-done-msg">🎉 오늘 운동 완료!</div>}
      </div>

      {/* Task list */}
      <div className="space-y">
        {tasks.map((task, i) => {
          const done = Boolean(cm[getTaskStorageKey(task)]);
          const isExp = expanded === i;
          const guide = getExerciseGuide(task.name);
          return (
            <div key={i} className={`task-card ${done ? 'is-done' : ''}`}>
              <div className="task-card__row">
                <button className={`task-check ${done ? 'is-done' : ''}`}
                  onClick={() => toggleTask(i)} aria-label={done ? '완료 취소' : '완료'}>
                  {done && '✓'}
                </button>
                <div className="task-card__info">
                  <div className={`task-card__name ${done ? 'is-done' : ''}`}>
                    {task.name}<ExCat name={task.name} />
                  </div>
                  <div className="task-card__sets">{task.sets}</div>
                </div>
                <button className="task-card__chevron"
                  onClick={() => setExpanded(isExp ? null : i)}>
                  {isExp ? '▲' : '▼'}
                </button>
              </div>
              {isExp && (
                <div className="task-card__desc">
                  <ExerciseIllustration taskName={task.name} />
                  <div className="task-guide">
                    <div className="task-guide__focus">{guide.focus}</div>
                    <p className="task-guide__summary">{guide.summary}</p>
                    <ul className="task-guide__list">
                      {guide.cues.map((cue) => (
                        <li key={cue}>{cue}</li>
                      ))}
                    </ul>
                    <div className="task-guide__tip">
                      <strong>오늘 루틴 설명</strong>
                      <p>{task.desc}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PROGRESS TAB
════════════════════════════════════════════ */
function ProgressTab({
  weightHistory, setWeightHistory, morningW, setMorningW,
  profile, week, setWeek, mode, progressState,
}: {
  weightHistory: WeightEntry[]; setWeightHistory: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  morningW: string; setMorningW: (v: string) => void;
  profile: ProfileState; week: number; setWeek: (w: number) => void;
  mode: LocationMode; progressState: ProgressState;
}) {
  const [toast, setToast] = useState<ToastState>(null);

  function saveWeight() {
    const v = parseFloat(morningW.replace(',', '.'));
    if (!v || v < 20 || v > 300) {
      setToast({ msg: '올바른 체중을 입력하세요 (20~300 kg)', type: 'error' });
      return;
    }
    const today = getLocalDateKey();
    setWeightHistory((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      return [...filtered, { date: today, weight: +v.toFixed(1) }]
        .sort((a, b) => a.date.localeCompare(b.date));
    });
    setMorningW('');
    setToast({ msg: '체중이 저장되었습니다!', type: 'success' });
  }

  const startW  = Number(profile.startWeightKg) || null;
  const h       = Number(profile.heightCm) || 0;
  const latestW = weightHistory.length ? weightHistory[weightHistory.length - 1].weight : null;
  const bmi     = latestW && h ? calculateBMI(h, latestW) : 0;
  const bmiInfo = getBmiInfo(bmi);
  const bmiStyle = getBmiBadgeStyle(bmiInfo.badge);
  const delta   = startW && latestW ? +(latestW - startW).toFixed(1) : null;
  const recent7 = weightHistory.slice(-7);
  const trend   = recent7.length >= 2
    ? +(recent7[recent7.length - 1].weight - recent7[0].weight).toFixed(1)
    : null;

  const heatmap = Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    let total = 0;
    for (let d = 0; d < 7; d++) total += getDayOverallProgress(progressState, w, d);
    return { w, pct: Math.round(total / 7) };
  });

  return (
    <div className="space-y">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Weight input */}
      <div className="card">
        <h3 className="card__title">📍 오늘 아침 체중</h3>
        <div className="weight-input-row">
          <input className="input" type="number" step="0.1" min="20" max="300"
            placeholder="kg 입력" value={morningW}
            onChange={(e) => setMorningW(sanitizeDecimalInput(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && saveWeight()} />
          <button className="btn-save" onClick={saveWeight}>저장</button>
        </div>
      </div>

      {/* Summary stats */}
      {(startW || latestW) && (
        <div className="grid-2">
          <div className="stat-card">
            <div className="stat-card__val" style={{ color: 'var(--text-2)' }}>
              {startW ? `${startW}kg` : '–'}
            </div>
            <div className="stat-card__label">시작 체중</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__val" style={{ color: 'var(--primary)' }}>
              {latestW ? `${latestW}kg` : '–'}
            </div>
            <div className="stat-card__label">현재 체중</div>
          </div>
          {delta != null && (
            <div className="stat-card">
              <div className="stat-card__val" style={{
                color: delta < 0 ? 'var(--success)' : delta > 0 ? 'var(--danger)' : 'var(--text-1)',
              }}>
                {delta > 0 ? '+' : ''}{delta}kg
              </div>
              <div className="stat-card__label">총 변화</div>
            </div>
          )}
          {trend != null && (
            <div className="stat-card">
              <div className="stat-card__val" style={{
                color: trend < 0 ? 'var(--success)' : trend > 0 ? 'var(--danger)' : 'var(--text-1)',
              }}>
                {trend > 0 ? '+' : ''}{trend}kg {trend < 0 ? '↓' : trend > 0 ? '↑' : '→'}
              </div>
              <div className="stat-card__label">최근 7일</div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <h3 className="card__title">체중 변화 그래프</h3>
        <WeightBars entries={weightHistory} />
      </div>

      {/* BMI */}
      {bmi > 0 && (
        <div className="card">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h3 className="card__title" style={{ margin: 0 }}>BMI</h3>
            <span className="bmi-badge" style={bmiStyle}>{bmiInfo.label}</span>
          </div>
          <div className="bmi-value">{bmi.toFixed(1)}</div>
          <div className="bmi-bar-wrap">
            <div className="bmi-bar-thumb" style={{ left: `${bmiInfo.pos}%` }} />
          </div>
          <div className="bmi-scale">
            <span>저체중‹18.5</span><span>정상 23</span><span>25›비만</span>
          </div>
        </div>
      )}

      {/* 12-week heatmap */}
      <div className="card">
        <h3 className="card__title">주차별 달성률</h3>
        <div className="heatmap">
          {heatmap.map(({ w, pct }) => (
            <div key={w}
              className={`heatmap-cell ${w === week ? 'is-current' : pct === 100 ? 'is-done' : pct > 0 ? 'is-partial' : ''}`}
              onClick={() => setWeek(w)}>
              <div className="heatmap-cell__week">{w}주</div>
              <div className="heatmap-cell__pct">{pct > 0 ? `${pct}%` : '–'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {weightHistory.length > 0 && (
        <div className="card">
          <h3 className="card__title">기록 내역</h3>
          <div className="history-list">
            {[...weightHistory].reverse().map((entry) => (
              <div key={entry.date} className="history-item">
                <span className="history-item__date">{entry.date}</span>
                <div className="row-gap">
                  <span className="history-item__weight">{entry.weight}kg</span>
                  <button className="history-item__del"
                    onClick={() => setWeightHistory((p) => p.filter((e) => e.date !== entry.date))}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   SETTINGS TAB
════════════════════════════════════════════ */
function SettingsTab({
  profile, setProfile, startDate, setStartDate, week, setWeek, resetAll,
}: {
  profile: ProfileState; setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
  startDate: string | null; setStartDate: (d: string | null) => void;
  week: number; setWeek: (w: number) => void;
  resetAll: () => void;
}) {
  const [toast, setToast] = useState<ToastState>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const autoWeek = getWeekFromStartDate(startDate);
  const sn = getStageNum(week);

  return (
    <div className="space-y">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Body info */}
      <div className="card">
        <h3 className="card__title">신체 정보</h3>
        <div style={{ marginBottom: 16 }}>
          <label className="input-label">성별</label>
          <div className="gender-group">
            <button className={`gender-btn male ${profile.gender === 'male' ? 'active' : ''}`}
              onClick={() => setProfile((p) => ({ ...p, gender: 'male' }))}>남성</button>
            <button className={`gender-btn female ${profile.gender === 'female' ? 'active' : ''}`}
              onClick={() => setProfile((p) => ({ ...p, gender: 'female' }))}>여성</button>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="input-label">키 (cm)</label>
          <input className="input" type="number" min="100" max="250" placeholder="예) 175"
            value={profile.heightCm}
            onChange={(e) => setProfile((p) => ({ ...p, heightCm: sanitizeDecimalInput(e.target.value) }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="input-label">시작 체중 (kg)</label>
          <input className="input" type="number" step="0.1" min="20" max="300" placeholder="예) 85.5"
            value={profile.startWeightKg}
            onChange={(e) => setProfile((p) => ({ ...p, startWeightKg: sanitizeDecimalInput(e.target.value) }))} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="input-label">허리둘레 (cm) — 선택</label>
          <input className="input" type="number" step="0.5" min="40" max="200" placeholder="예) 92.0"
            value={profile.waistCm}
            onChange={(e) => setProfile((p) => ({ ...p, waistCm: sanitizeDecimalInput(e.target.value) }))} />
        </div>
        <button className="btn btn-primary"
          onClick={() => setToast({ msg: '저장되었습니다!', type: 'success' })}>저장</button>
      </div>

      {/* Start date */}
      <div className="card">
        <h3 className="card__title">시작일 설정</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 12px' }}>
          설정하면 현재 주차가 자동 계산됩니다.
        </p>
        <input className="input" type="date" value={startDate ?? ''}
          style={{ marginBottom: 10 }}
          onChange={(e) => {
            const val = e.target.value || null;
            setStartDate(val);
            if (val) setWeek(getWeekFromStartDate(val));
          }} />
        {startDate && (
          <div style={{
            background: 'var(--primary-pale)', border: '1px solid #c7d2fe',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>계산된 현재 주차</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>{autoWeek}주차</span>
          </div>
        )}
      </div>

      {/* Manual week */}
      <div className="card">
        <h3 className="card__title">주차 수동 설정</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 12px' }}>
          시작일 없이 직접 입력합니다.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="week-nav__arrow" onClick={() => setWeek(Math.max(1, week - 1))}>‹</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)' }}>{week}주차</div>
            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
              Stage {sn} · {getStageLabel(sn)}
            </div>
          </div>
          <button className="week-nav__arrow" onClick={() => setWeek(Math.min(12, week + 1))}>›</button>
        </div>
      </div>

      {/* Reset */}
      <div className="card" style={{ borderColor: '#fecaca' }}>
        <h3 className="card__title" style={{ color: 'var(--danger)' }}>데이터 초기화</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 14px' }}>
          모든 운동 기록과 체중 기록이 삭제됩니다. 되돌릴 수 없습니다.
        </p>
        {!confirmReset
          ? <button className="btn btn-outline-danger" onClick={() => setConfirmReset(true)}>초기화</button>
          : (
            <div className="row-gap">
              <button className="btn btn-pill-danger"
                onClick={() => { resetAll(); setConfirmReset(false); setToast({ msg: '초기화 완료', type: 'success' }); }}>
                삭제 확인
              </button>
              <button className="btn btn-pill-cancel" onClick={() => setConfirmReset(false)}>취소</button>
            </div>
          )}
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', paddingBottom: 8 }}>
        뱃살 마스터 v2.0 · 12주 복부지방 감량 프로그램
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════
   APP ROOT
════════════════════════════════════════════ */
const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'home',     icon: '🏠', label: '홈'   },
  { key: 'workout',  icon: '💪', label: '운동' },
  { key: 'progress', icon: '📊', label: '기록' },
  { key: 'settings', icon: '⚙️', label: '설정' },
];

export default function App() {
  const [tab, setTab]               = useState<TabKey>('home');
  const [week, setWeek]             = useState(1);
  const [day, setDay]               = useState(getTodayDayIndex());
  const [mode, setMode]             = useState<LocationMode>('gym');
  const [progressState, setProgressState] = useState<ProgressState>({});
  const [profile, setProfile]       = useState<ProfileState>({
    gender: 'male', heightCm: '', startWeightKg: '', waistCm: '',
  });
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [morningW, setMorningW]     = useState('');
  const [startDate, setStartDate]   = useState<string | null>(null);

  const applyWeek = useCallback((nextWeek: number) => {
    setWeek(nextWeek);
    setMode((prev) => getPreferredModeForDay(progressState, nextWeek, day, prev));
  }, [day, progressState]);

  const applyDay = useCallback((nextDay: number) => {
    setDay(nextDay);
    setMode((prev) => getPreferredModeForDay(progressState, week, nextDay, prev));
  }, [progressState, week]);

  /* Load */
  useEffect(() => {
    const p  = readStoredJson<ProgressState>(K_PROGRESS, {});
    const pro = readStoredJson<ProfileState>(K_PROFILE, { gender: 'male', heightCm: '', startWeightKg: '', waistCm: '' });
    const wh = readStoredJson<WeightEntry[]>(K_WEIGHTS, []);
    const sd = readStoredJson<string | null>(K_STARTDATE, null);
    const m  = readStoredJson<LocationMode>(K_MODE, 'gym');
    const initialWeek = sd ? getWeekFromStartDate(sd) : 1;
    setProgressState(p);
    setProfile(pro);
    setWeightHistory(wh);
    setMode(getPreferredModeForDay(p, initialWeek, getTodayDayIndex(), m));
    if (sd) {
      setStartDate(sd);
      setWeek(initialWeek);
    }
  }, []);

  useEffect(() => {
    const todayEntry = weightHistory.find((entry) => entry.date === getLocalDateKey());
    if (todayEntry) {
      setMorningW(String(todayEntry.weight));
    }
  }, [weightHistory]);

  /* Persist */
  useEffect(() => { writeStoredJson(K_PROGRESS, progressState); }, [progressState]);
  useEffect(() => { writeStoredJson(K_PROFILE, profile); },        [profile]);
  useEffect(() => { writeStoredJson(K_WEIGHTS, weightHistory); },  [weightHistory]);
  useEffect(() => { writeStoredJson(K_STARTDATE, startDate); },    [startDate]);
  useEffect(() => { writeStoredJson(K_MODE, mode); },              [mode]);

  function resetAll() {
    setProgressState({});
    setWeightHistory([]);
    writeStoredJson(K_PROGRESS, {});
    writeStoredJson(K_WEIGHTS, []);
  }

  const sn = getStageNum(week);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__brand">
          <h1>뱃살 마스터</h1>
          <p>12주 복부지방 감량 프로그램</p>
        </div>
        <div className="app-header__meta">
          <div className="app-header__week">{week}주차</div>
          <div className="app-header__stage">Stage {sn}</div>
        </div>
      </header>

      <main className="app-content">
        {tab === 'home' && (
          <HomeTab week={week} day={day} mode={mode}
            progressState={progressState} weightHistory={weightHistory}
            profile={profile} startDate={startDate} onNavigate={setTab} />
        )}
        {tab === 'workout' && (
          <WorkoutTab week={week} setWeek={applyWeek} day={day} setDay={applyDay}
            mode={mode} setMode={setMode}
            progressState={progressState} setProgressState={setProgressState} />
        )}
        {tab === 'progress' && (
          <ProgressTab weightHistory={weightHistory} setWeightHistory={setWeightHistory}
            morningW={morningW} setMorningW={setMorningW}
            profile={profile} week={week} setWeek={applyWeek}
            mode={mode} progressState={progressState} />
        )}
        {tab === 'settings' && (
          <SettingsTab profile={profile} setProfile={setProfile}
            startDate={startDate} setStartDate={setStartDate}
            week={week} setWeek={applyWeek} resetAll={resetAll} />
        )}
      </main>

      <nav className="bottom-nav">
        <div className="bottom-nav__list">
          {TABS.map((t) => (
            <button key={t.key}
              className={`bottom-nav__btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>
              <span className="bottom-nav__icon">{t.icon}</span>
              <span>{t.label}</span>
              <div className="bottom-nav__underline" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
