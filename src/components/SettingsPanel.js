import React, { useRef, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { makeId } from '../lib/planner';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const TYPE_LABELS = { core: '교과', noncore: '비교과', online: '온라인' };
const DEFAULT_LEAD_DAYS = { core: 2, noncore: 6, online: 0 };

const Section = ({ title, description, children }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-4">
    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
    {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

const WeekdayPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1">
    {WEEKDAY_NAMES.map((name, idx) => (
      <button
        key={idx}
        type="button"
        onClick={() =>
          onChange(value.includes(idx) ? value.filter((d) => d !== idx) : [...value, idx].sort())
        }
        className={`h-7 w-7 rounded text-xs font-semibold ${
          value.includes(idx) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {name}
      </button>
    ))}
  </div>
);

const CourseForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('core');
  const [weekdays, setWeekdays] = useState([]);
  const [leadDays, setLeadDays] = useState(2);
  const [startDate, setStartDate] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || weekdays.length === 0) return;
    onAdd({
      id: makeId(),
      name: name.trim(),
      type,
      weekdays,
      leadDays: Number(leadDays),
      startDate: startDate || null,
      active: true,
    });
    setName('');
    setWeekdays([]);
    setLeadDays(DEFAULT_LEAD_DAYS[type]);
    setStartDate('');
  };

  return (
    <form onSubmit={submit} className="space-y-2 rounded border border-dashed border-gray-300 p-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="과목/수업 이름"
          className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setLeadDays(DEFAULT_LEAD_DAYS[e.target.value]);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="core">교과 (1–2영업일 전)</option>
          <option value="noncore">비교과 (5–7일 전)</option>
          <option value="online">온라인 진도 확인 (당일)</option>
        </select>
      </div>
      <div className="flex items-center justify-between gap-3">
        <WeekdayPicker value={weekdays} onChange={setWeekdays} />
        {type !== 'online' && (
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
            준비 기간
            <input
              type="number"
              min={1}
              max={10}
              value={leadDays}
              onChange={(e) => setLeadDays(e.target.value)}
              className="w-14 rounded border border-gray-300 px-1.5 py-1 text-sm focus:border-gray-500 focus:outline-none"
            />
            {type === 'core' ? '영업일 전' : '일 전'}
          </label>
        )}
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-500">
        시작일 (선택 — 이 날짜 이전 수업은 준비 할 일을 만들지 않아요)
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded border border-gray-300 px-1.5 py-1 text-xs focus:border-gray-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-1 rounded bg-gray-900 py-1.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        <Plus className="h-3.5 w-3.5" /> 과목 추가
      </button>
    </form>
  );
};

const CoursesSection = ({ courses, setCourses }) => (
  <Section
    title="교과 · 비교과 · 온라인 수업"
    description="수업 요일을 등록하면 다가오는 2주 안에서 준비 할 일이 자동으로 생겨요. 교과는 수업 1–2영업일 전, 비교과는 5–7일 전(주말·제외일 피해서)에 배치되고, 온라인 진도 확인은 수업 당일에 가벼운 체크 할 일로 생겨요. 학교 시간표(교사 Time Schedule)를 기준으로 처음부터 등록해 뒀어요 — 실라버스가 바뀌면 여기서 수정하세요."
  >
    <div className="mb-3 space-y-2">
      {courses.length === 0 && (
        <p className="text-xs text-gray-400">등록된 수업이 없어요. 아래에서 추가해 주세요.</p>
      )}
      {courses.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-gray-800">
              {c.name}{' '}
              <span className="text-xs font-normal text-gray-400">
                ({TYPE_LABELS[c.type]} ·{' '}
                {c.type === 'online' ? '당일 확인' : `${c.leadDays}${c.type === 'core' ? '영업일' : '일'} 전`})
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              {c.weekdays.map((d) => WEEKDAY_NAMES[d]).join(', ')}요일 수업
              {c.startDate && ` · ${c.startDate}부터`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[11px] text-gray-500">
              <input
                type="checkbox"
                checked={c.active !== false}
                onChange={() =>
                  setCourses(courses.map((x) => (x.id === c.id ? { ...x, active: !(x.active !== false) } : x)))
                }
              />
              사용중
            </label>
            <button
              onClick={() => setCourses(courses.filter((x) => x.id !== c.id))}
              className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
    <CourseForm onAdd={(c) => setCourses([...courses, c])} />
  </Section>
);

const ReviewProjectCard = ({ project, onChange, onDelete }) => {
  const [newUnit, setNewUnit] = useState('');

  const addUnit = () => {
    if (!newUnit.trim()) return;
    onChange({
      ...project,
      units: [...project.units, { id: makeId(), label: newUnit.trim() }],
    });
    setNewUnit('');
  };

  return (
    <div className="rounded border border-gray-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <input
          value={project.name}
          onChange={(e) => onChange({ ...project, name: e.target.value })}
          className="w-full rounded border border-gray-200 px-2 py-1 text-sm font-semibold focus:border-gray-500 focus:outline-none"
        />
        <button onClick={onDelete} className="shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <label className="flex items-center gap-1.5 text-gray-500">
          시작일
          <input
            type="date"
            value={project.startDate}
            onChange={(e) => onChange({ ...project, startDate: e.target.value })}
            className="rounded border border-gray-300 px-1.5 py-1 text-xs focus:border-gray-500 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-gray-500">
          목표일
          <input
            type="date"
            value={project.endDate}
            onChange={(e) => onChange({ ...project, endDate: e.target.value })}
            className="rounded border border-gray-300 px-1.5 py-1 text-xs focus:border-gray-500 focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          제외일 (쉼표로 구분, 예: 2026-08-18, 2026-08-24)
          <input
            defaultValue={project.blockoutDates.join(', ')}
            onBlur={(e) =>
              onChange({
                ...project,
                blockoutDates: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="flex-1 rounded border border-gray-300 px-1.5 py-1 text-xs focus:border-gray-500 focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-2">
        <div className="text-[11px] font-medium text-gray-500">
          회차 / 챕터 ({project.units.length}개 — 자동 갱신 시 시작일~목표일 사이에 고르게 배분됩니다)
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {project.units.map((u) => (
            <span
              key={u.id}
              className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] text-purple-700"
            >
              {u.label}
              <button
                onClick={() => onChange({ ...project, units: project.units.filter((x) => x.id !== u.id) })}
                className="text-purple-400 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1.5">
          <input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUnit())}
            placeholder="예: 17장 감수"
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-500 focus:outline-none"
          />
          <button
            onClick={addUnit}
            className="rounded bg-gray-900 px-2 text-xs font-semibold text-white hover:bg-gray-800"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewProjectsSection = ({ projects, setProjects }) => (
  <Section
    title="감수 · 원고 작업 프로젝트"
    description="하이성 같은 감수 작업을 프로젝트로 등록하면 시작일~목표일 사이 여유 시간에 회차별로 자동 배분돼요. 원고가 아직 없으면 회차를 비워두거나 안내 문구 하나만 남겨두세요."
  >
    <div className="space-y-2">
      {projects.map((p) => (
        <ReviewProjectCard
          key={p.id}
          project={p}
          onChange={(next) => setProjects(projects.map((x) => (x.id === p.id ? next : x)))}
          onDelete={() => setProjects(projects.filter((x) => x.id !== p.id))}
        />
      ))}
      <button
        onClick={() =>
          setProjects([
            ...projects,
            {
              id: makeId(),
              name: '새 프로젝트',
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date().toISOString().slice(0, 10),
              blockoutDates: [],
              units: [],
            },
          ])
        }
        className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-1.5 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50"
      >
        <Plus className="h-3.5 w-3.5" /> 프로젝트 추가
      </button>
    </div>
  </Section>
);

const ExcludedDatesSection = ({ excludedDates, setExcludedDates }) => {
  const [newDate, setNewDate] = useState('');
  return (
    <Section
      title="제외일 (공휴일 · 출장 · 교사교육 등)"
      description="여기 등록된 날짜는 교과/비교과 준비일과 감수 회차 배분에서 제외돼요."
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {excludedDates.map((d) => (
          <span
            key={d}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
          >
            {d}
            <button
              onClick={() => setExcludedDates(excludedDates.filter((x) => x !== d))}
              className="text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </span>
        ))}
        {excludedDates.length === 0 && <span className="text-xs text-gray-400">없음</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-500 focus:outline-none"
        />
        <button
          onClick={() => {
            if (newDate && !excludedDates.includes(newDate)) {
              setExcludedDates([...excludedDates, newDate].sort());
              setNewDate('');
            }
          }}
          className="rounded bg-gray-900 px-3 text-xs font-semibold text-white hover:bg-gray-800"
        >
          추가
        </button>
      </div>
    </Section>
  );
};

const ExerciseSection = ({ exerciseWeekdays, setExerciseWeekdays }) => (
  <Section title="운동" description="주 3회, 시간 없이 할 일로만 표시돼요.">
    <WeekdayPicker value={exerciseWeekdays} onChange={setExerciseWeekdays} />
  </Section>
);

const TidySection = ({ tidyWeekdays, setTidyWeekdays }) => (
  <Section
    title="정리"
    description="주 3회, 40분씩. 그날 근무시간 외 업무(수업/시험 준비 마감)가 이미 2건 이상이면 자동으로 건너뛰어요."
  >
    <WeekdayPicker value={tidyWeekdays} onChange={setTidyWeekdays} />
  </Section>
);

const DataSection = ({ fullState, onImport, onReset }) => {
  const fileRef = useRef(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-prep-plan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        onImport(parsed);
      } catch {
        alert('올바른 JSON 파일이 아니에요.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Section title="데이터 관리" description="이 브라우저에 저장돼요. 백업하거나 다른 기기로 옮길 때 사용하세요.">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportData}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          내보내기 (JSON)
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          가져오기
        </button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
        <button
          onClick={() => {
            if (window.confirm('처음 계획(하이성/방정리/피난안내도 초기 데이터)으로 되돌릴까요? 지금 데이터는 사라져요.')) {
              onReset();
            }
          }}
          className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          초기 계획으로 되돌리기
        </button>
      </div>
    </Section>
  );
};

const SettingsPanel = ({
  state,
  lastSyncedAt,
  onRegenerate,
  setCourses,
  setReviewProjects,
  setExcludedDates,
  setExerciseWeekdays,
  setTidyWeekdays,
  onImport,
  onReset,
}) => (
  <div className="mx-auto max-w-2xl space-y-4">
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">자동 갱신</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          앱을 열 때마다 오늘부터 2주치 준비 할 일을 자동으로 다시 계산해요. 완료 표시와 메모는
          그대로 유지돼요. 이 앱은 정적 웹앱이라 매주 금요일마다 스스로 깨어날 수는 없으니, 설정을
          바꾼 뒤에는 아래 버튼으로 바로 반영하세요.
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          마지막 갱신: {new Date(lastSyncedAt).toLocaleString('ko-KR')}
        </p>
      </div>
      <button
        onClick={onRegenerate}
        className="flex shrink-0 items-center gap-1.5 rounded bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
      >
        <RefreshCw className="h-3.5 w-3.5" /> 지금 갱신
      </button>
    </div>

    <CoursesSection courses={state.courses} setCourses={setCourses} />
    <ReviewProjectsSection projects={state.reviewProjects} setProjects={setReviewProjects} />
    <ExcludedDatesSection excludedDates={state.excludedDates} setExcludedDates={setExcludedDates} />
    <ExerciseSection exerciseWeekdays={state.exerciseWeekdays} setExerciseWeekdays={setExerciseWeekdays} />
    <TidySection tidyWeekdays={state.tidyWeekdays} setTidyWeekdays={setTidyWeekdays} />
    <DataSection fullState={state} onImport={onImport} onReset={onReset} />
  </div>
);

export default SettingsPanel;
