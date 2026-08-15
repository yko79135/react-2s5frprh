import { useCallback, useEffect, useRef, useState } from 'react';
import { todayISO } from './dateUtils';
import {
  applyRollover,
  buildSeedState,
  DEFAULT_COURSES,
  makeId,
  regenerateAutoTasks,
  SCHOOL_SETUP_TASKS,
} from './planner';

const STORAGE_KEY = 'classPrepPlanner:v1';

const loadState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) — silently skip persistence
  }
};

export const usePlanner = () => {
  const [state, setState] = useState(() => loadState() || buildSeedState());
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const initialized = useRef(false);

  // On first mount: bring the rolling 2-week window up to date and roll
  // over anything undone from a past date onto today. This is the
  // client-side stand-in for the "check every Friday / every midnight"
  // automation described in the original plan — a static web app has no
  // server to run a cron job, so it re-syncs whenever it's opened instead.
  //
  // One-time migration: installs saved before the real teaching schedule was
  // read from Drive have an empty course list. Backfill it (and the matching
  // one-off setup tasks) exactly once — once courses exist, this never runs again.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setState((prev) => {
      let next = prev;
      if (next.courses.length === 0) {
        const setupTasks = SCHOOL_SETUP_TASKS.map((t) => ({
          id: makeId(),
          priority: 'normal',
          notes: '',
          done: false,
          autoKey: null,
          createdAt: Date.now(),
          ...t,
        }));
        next = { ...next, courses: DEFAULT_COURSES, tasks: [...next.tasks, ...setupTasks] };
      }
      const withRolledOver = { ...next, tasks: applyRollover(next.tasks, todayISO()) };
      const tasks = regenerateAutoTasks(withRolledOver);
      return { ...withRolledOver, tasks };
    });
    setLastSyncedAt(Date.now());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const regenerate = useCallback(() => {
    setState((prev) => {
      const withRolledOver = { ...prev, tasks: applyRollover(prev.tasks, todayISO()) };
      const tasks = regenerateAutoTasks(withRolledOver);
      return { ...withRolledOver, tasks };
    });
    setLastSyncedAt(Date.now());
  }, []);

  const addTask = useCallback((task) => {
    setState((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: makeId(),
          title: task.title,
          category: task.category || 'other',
          date: task.date || todayISO(),
          priority: task.priority || 'normal',
          notes: task.notes || '',
          done: false,
          autoKey: null,
          createdAt: Date.now(),
        },
      ],
    }));
  }, []);

  const updateTask = useCallback((id, patch) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const toggleTask = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id) => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }, []);

  const setCourses = useCallback((courses) => {
    setState((prev) => ({ ...prev, courses }));
  }, []);

  const setReviewProjects = useCallback((reviewProjects) => {
    setState((prev) => ({ ...prev, reviewProjects }));
  }, []);

  const setExcludedDates = useCallback((excludedDates) => {
    setState((prev) => ({ ...prev, excludedDates }));
  }, []);

  const setExerciseWeekdays = useCallback((exerciseWeekdays) => {
    setState((prev) => ({ ...prev, exerciseWeekdays }));
  }, []);

  const resetToSeed = useCallback(() => {
    setState(buildSeedState());
    setLastSyncedAt(Date.now());
  }, []);

  const importState = useCallback((imported) => {
    setState(imported);
    setLastSyncedAt(Date.now());
  }, []);

  return {
    state,
    lastSyncedAt,
    regenerate,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    setCourses,
    setReviewProjects,
    setExcludedDates,
    setExerciseWeekdays,
    resetToSeed,
    importState,
  };
};
