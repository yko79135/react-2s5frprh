import {
  addDays,
  compareISO,
  dateRange,
  formatMD,
  subtractBusinessDays,
  subtractCalendarDaysAvoiding,
  todayISO,
  weekdayIndex,
} from './dateUtils';

export const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const FIXED_SCHEDULE = [
  { id: 'work', label: '근무·수업', weekdays: [1, 2, 3, 4, 5], time: '08:00–17:00' },
  { id: 'friday-vigil', label: '금요철야', weekdays: [5], time: '20:00–22:00' },
  {
    id: 'church',
    label: '교회 일정',
    weekdays: [0],
    time: '09:00–16:00 (8월엔 13:30까지)',
    note: (iso) => (iso.slice(0, 7) === '2026-08' ? '8월엔 09:00–13:30' : null),
  },
];

export const getFixedScheduleForDate = (iso) => {
  const day = weekdayIndex(iso);
  return FIXED_SCHEDULE.filter((f) => f.weekdays.includes(day)).map((f) => ({
    ...f,
    time: f.note && f.note(iso) ? f.note(iso) : f.time,
  }));
};

// ---- auto-generators -------------------------------------------------

// 교과: N business days before class. 비교과: N calendar days before, nudged off weekends/exclusions.
export const generateCourseTasks = (courses, windowStart, windowEnd, excludedDates) => {
  const tasks = [];
  const scanEnd = addDays(windowEnd, 10);
  for (const course of courses) {
    if (course.active === false) continue;
    for (const occ of dateRange(windowStart, scanEnd)) {
      if (!course.weekdays.includes(weekdayIndex(occ))) continue;
      const due =
        course.type === 'core'
          ? subtractBusinessDays(occ, course.leadDays, excludedDates)
          : subtractCalendarDaysAvoiding(occ, course.leadDays, excludedDates);
      if (compareISO(due, windowStart) < 0 || compareISO(due, windowEnd) > 0) continue;
      tasks.push({
        autoKey: `course:${course.id}:${occ}`,
        title: `${course.name} 수업 준비 (${formatMD(occ)} 수업)`,
        category: course.type,
        date: due,
        originalDate: due,
        priority: 'deadline',
        notes: '',
        done: false,
      });
    }
  }
  return tasks;
};

export const generateExerciseTasks = (windowStart, windowEnd, weekdays) => {
  const tasks = [];
  for (const iso of dateRange(windowStart, windowEnd)) {
    if (!weekdays.includes(weekdayIndex(iso))) continue;
    tasks.push({
      autoKey: `exercise:${iso}`,
      title: '운동 40분',
      category: 'exercise',
      date: iso,
      originalDate: iso,
      priority: 'normal',
      notes: '',
      done: false,
    });
  }
  return tasks;
};

// Spreads a project's remaining units one-per-available-day across [startDate, endDate],
// skipping blockoutDates. If more units than days, later units double up on the last days.
export const generateReviewProjectTasks = (project) => {
  const available = dateRange(project.startDate, project.endDate).filter(
    (d) => !project.blockoutDates.includes(d)
  );
  if (available.length === 0 || project.units.length === 0) return [];
  return project.units.map((unit, idx) => {
    const day = available[Math.min(idx, available.length - 1)];
    return {
      autoKey: `review:${project.id}:${unit.id}`,
      title: `${project.name} — ${unit.label}`,
      category: 'review',
      date: day,
      originalDate: day,
      priority: unit.deadline ? 'deadline' : 'normal',
      notes: '',
      done: false,
      project: project.name,
    };
  });
};

// Preserve done/notes/current(possibly rolled-over) date for tasks that already existed.
export const mergeAutoTasks = (existingTasks, freshAutoTasks) => {
  const existingByKey = new Map(
    existingTasks.filter((t) => t.autoKey).map((t) => [t.autoKey, t])
  );
  const manualTasks = existingTasks.filter((t) => !t.autoKey);
  const freshKeys = new Set(freshAutoTasks.map((t) => t.autoKey));

  const merged = freshAutoTasks.map((fresh) => {
    const prior = existingByKey.get(fresh.autoKey);
    if (prior) {
      return {
        ...fresh,
        id: prior.id,
        done: prior.done,
        notes: prior.notes,
        date: prior.date,
        createdAt: prior.createdAt,
      };
    }
    return { ...fresh, id: makeId(), createdAt: Date.now() };
  });

  // Auto tasks whose source no longer produces them (window moved on, project edited)
  // are kept as-is rather than silently deleted, so history isn't lost.
  const orphaned = existingTasks.filter((t) => t.autoKey && !freshKeys.has(t.autoKey));

  return [...manualTasks, ...orphaned, ...merged];
};

export const regenerateAutoTasks = (state) => {
  const windowStart = todayISO();
  const windowEnd = addDays(windowStart, 13);
  const fresh = [
    ...generateCourseTasks(state.courses, windowStart, windowEnd, state.excludedDates),
    ...generateExerciseTasks(windowStart, windowEnd, state.exerciseWeekdays),
    ...state.reviewProjects.flatMap(generateReviewProjectTasks),
  ];
  return mergeAutoTasks(state.tasks, fresh);
};

// Any undone task whose date has passed rolls forward onto today.
export const applyRollover = (tasks, todayIso) =>
  tasks.map((t) => {
    if (!t.done && compareISO(t.date, todayIso) < 0) {
      return { ...t, date: todayIso, rolledOver: true };
    }
    return t;
  });

// ---- seed data (the real plan carried over from the ChatGPT conversation) ----

export const buildSeedState = () => {
  const manualTasks = [
    {
      title: '3·4층 피난안내도 4개 부착 및 현장 방향 검수',
      category: 'urgent',
      date: '2026-08-18',
    },
    {
      title: '방 정리 — 전체 분류 및 바닥 통로 확보',
      category: 'room',
      date: '2026-08-15',
    },
    { title: '방 정리 — 옷·가방·침구', category: 'room', date: '2026-08-17' },
    {
      title: '방 정리 — 책상·책·서류·전자기기',
      category: 'room',
      date: '2026-08-22',
    },
    { title: '방 정리 — 서랍·선반·잡동사니', category: 'room', date: '2026-08-23' },
    { title: '방 정리 — 배출·청소·최종 배치', category: 'room', date: '2026-08-29' },
    {
      title: '하이성 2 — 통합 QA (일관성·인용·쪽수 점검)',
      category: 'review',
      date: '2026-08-27',
      priority: 'deadline',
      project: '하이성 2',
    },
    {
      title: '하이성 2 — 최종 점검 및 완료 → 하이성 3 착수 준비',
      category: 'review',
      date: '2026-08-28',
      priority: 'deadline',
      project: '하이성 2',
    },
  ].map((t) => ({
    id: makeId(),
    priority: 'normal',
    notes: '',
    done: false,
    autoKey: null,
    createdAt: Date.now(),
    ...t,
  }));

  const chapterUnits = [9, 10, 11, 12, 13, 14, 15, 16].map((n) => ({
    id: `ch${n}`,
    label: `${n}장 감수`,
  }));

  const reviewProjects = [
    {
      id: 'haiseong-2-review',
      name: '하이성 2',
      startDate: '2026-08-15',
      endDate: '2026-08-26',
      blockoutDates: ['2026-08-18', '2026-08-24'],
      units: [
        ...chapterUnits,
        { id: 'buf1', label: '9–16장 보충·재검토' },
        { id: 'buf2', label: '여유 세션 (오탈자·보충)' },
      ],
    },
    {
      id: 'haiseong-3-review',
      name: '하이성 3',
      startDate: '2026-08-29',
      endDate: '2026-08-29',
      blockoutDates: [],
      units: [{ id: 'manuscript-needed', label: '원고 필요 — 목차만 있고 쪽수 미정' }],
    },
  ];

  return {
    tasks: manualTasks,
    courses: [],
    reviewProjects,
    excludedDates: ['2026-08-18', '2026-08-24'],
    exerciseWeekdays: [1, 2, 4],
  };
};
