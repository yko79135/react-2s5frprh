const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export const toISO = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
};

export const todayISO = () => toISO(new Date());

export const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso, n) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const isWeekend = (iso) => {
  const day = parseISO(iso).getDay();
  return day === 0 || day === 6;
};

export const weekdayIndex = (iso) => parseISO(iso).getDay();

export const weekdayLabel = (iso) => WEEKDAY_LABELS[weekdayIndex(iso)];

export const formatMD = (iso) => {
  const d = parseISO(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const formatMDDow = (iso) => `${formatMD(iso)}(${weekdayLabel(iso)})`;

export const compareISO = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// Step backward counting only business days (skips weekends + excluded dates).
export const subtractBusinessDays = (iso, n, excluded = []) => {
  let cur = iso;
  let count = 0;
  while (count < n) {
    cur = addDays(cur, -1);
    if (!isWeekend(cur) && !excluded.includes(cur)) count++;
  }
  return cur;
};

// Step back n calendar days, then nudge earlier off weekends/excluded dates.
export const subtractCalendarDaysAvoiding = (iso, n, excluded = []) => {
  let cur = addDays(iso, -n);
  while (isWeekend(cur) || excluded.includes(cur)) {
    cur = addDays(cur, -1);
  }
  return cur;
};

// Inclusive list of ISO dates from start to end.
export const dateRange = (startIso, endIso) => {
  const out = [];
  let cur = startIso;
  while (compareISO(cur, endIso) <= 0) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
};
