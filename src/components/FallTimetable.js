import React from 'react';
import { CATEGORIES } from '../lib/categories';
import { FIXED_SCHEDULE } from '../lib/planner';

const WEEKDAYS = [
  { idx: 1, label: '월' },
  { idx: 2, label: '화' },
  { idx: 3, label: '수' },
  { idx: 4, label: '목' },
  { idx: 5, label: '금' },
  { idx: 6, label: '토' },
  { idx: 0, label: '일' },
];

const TYPE_LEAD_LABEL = { core: '1–2영업일 전', noncore: '5–7일 전', online: '당일 확인' };

const FixedEntry = ({ item }) => (
  <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
    <div className="text-xs font-semibold text-gray-700">{item.label}</div>
    <div className="text-[11px] text-gray-400">{item.time}</div>
  </div>
);

const CourseEntry = ({ course }) => {
  const cat = CATEGORIES[course.type] || CATEGORIES.other;
  return (
    <div className={`rounded border px-2 py-1.5 ${cat.bg} ${cat.border}`}>
      <div className={`text-xs font-semibold ${cat.text}`}>{course.name}</div>
      <div className="text-[11px] text-gray-400">
        {cat.label.replace(' 수업 준비', '').replace(' 수업 확인', '')} · {TYPE_LEAD_LABEL[course.type]}
      </div>
    </div>
  );
};

const DayColumn = ({ idx, label, courses }) => {
  const fixed = FIXED_SCHEDULE.filter((f) => f.weekdays.includes(idx));
  const dayCourses = courses.filter((c) => c.active !== false && c.weekdays.includes(idx));

  return (
    <div className="flex w-40 shrink-0 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="rounded-t-lg bg-gray-900 px-2.5 py-2 text-center text-sm font-bold text-white">
        {label}요일
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        {fixed.map((f) => (
          <FixedEntry key={f.id} item={f} />
        ))}
        {dayCourses.map((c) => (
          <CourseEntry key={c.id} course={c} />
        ))}
        {fixed.length === 0 && dayCourses.length === 0 && (
          <div className="py-2 text-center text-[11px] text-gray-300">-</div>
        )}
      </div>
    </div>
  );
};

const FallTimetable = ({ courses }) => {
  const termStart = courses.find((c) => c.startDate)?.startDate || '2026-08-26';

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-gray-900">2026 가을학기 시간표</h2>
      <p className="mb-3 text-xs text-gray-400">
        {termStart} 개강 기준 주간 시간표예요. 요일별 고정 일정과 수업이 함께 표시돼요. 수업 내용은
        설정 탭의 "교과 · 비교과 · 온라인 수업"에서 수정할 수 있어요.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {WEEKDAYS.map(({ idx, label }) => (
          <DayColumn key={idx} idx={idx} label={label} courses={courses} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${CATEGORIES.core.dot}`} /> 교과
        </span>
        <span className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${CATEGORIES.noncore.dot}`} /> 비교과
        </span>
        <span className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${CATEGORIES.online.dot}`} /> 온라인
        </span>
      </div>
    </div>
  );
};

export default FallTimetable;
