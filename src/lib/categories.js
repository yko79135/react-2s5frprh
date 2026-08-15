export const CATEGORIES = {
  urgent: {
    label: '급선무',
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    chip: 'bg-red-100 text-red-700',
  },
  core: {
    label: '교과 수업 준비',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    chip: 'bg-blue-100 text-blue-700',
  },
  noncore: {
    label: '비교과 수업 준비',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-700',
    chip: 'bg-amber-100 text-amber-700',
  },
  review: {
    label: '하이성 감수',
    dot: 'bg-purple-400',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    chip: 'bg-purple-100 text-purple-700',
  },
  room: {
    label: '방 정리',
    dot: 'bg-green-400',
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    chip: 'bg-green-100 text-green-700',
  },
  exercise: {
    label: '운동',
    dot: 'bg-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    text: 'text-teal-700',
    chip: 'bg-teal-100 text-teal-700',
  },
  other: {
    label: '기타',
    dot: 'bg-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-700',
    chip: 'bg-gray-100 text-gray-700',
  },
};

// Lower = shown first within a day, before priority ties are broken by title.
export const CATEGORY_RANK = {
  urgent: 0,
  core: 1,
  noncore: 1,
  review: 2,
  room: 3,
  exercise: 4,
  other: 5,
};

export const PRIORITY_RANK = { urgent: 0, deadline: 1, normal: 2 };

export const PRIORITY_LABELS = {
  urgent: '급선무',
  deadline: '마감임박',
  normal: '일반',
};

export const taskSortKey = (t) => {
  const priority = t.category === 'urgent' ? 'urgent' : t.priority;
  return [PRIORITY_RANK[priority] ?? 2, CATEGORY_RANK[t.category] ?? 5];
};

export const sortTasks = (tasks) =>
  [...tasks].sort((a, b) => {
    const ka = taskSortKey(a);
    const kb = taskSortKey(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] - kb[1];
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
