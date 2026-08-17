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
import { PLANNER_STATE_ROW_ID, PLANNER_STATE_TABLE, supabase } from './supabaseClient';

const STORAGE_KEY = 'classPrepPlanner:v1';

const loadLocalCache = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveLocalCache = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) — silently skip persistence
  }
};

const runMigrationsAndRollover = (prev) => {
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
  return { ...withRolledOver, tasks: regenerateAutoTasks(withRolledOver) };
};

// Planner data lives in Supabase (table `class_prep_planner_state`, single row
// id='default') so it can be updated from outside the browser — e.g. by an
// agent acting on a chat request — and not just from this app's own UI.
// localStorage is kept as a write-through cache: it seeds the very first
// Supabase row (so nothing already on the device is lost) and lets the app
// still render something if Supabase is briefly unreachable.
export const usePlanner = () => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const remoteUpdateRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let channel;

    (async () => {
      const { data, error } = await supabase
        .from(PLANNER_STATE_TABLE)
        .select('state')
        .eq('id', PLANNER_STATE_ROW_ID)
        .maybeSingle();

      let initialState;
      if (!error && data?.state) {
        initialState = data.state;
      } else {
        initialState = loadLocalCache() || buildSeedState();
        await supabase
          .from(PLANNER_STATE_TABLE)
          .upsert({ id: PLANNER_STATE_ROW_ID, state: initialState, updated_at: new Date().toISOString() });
      }

      const finalState = runMigrationsAndRollover(initialState);
      if (cancelled) return;
      setState(finalState);
      setLoading(false);
      setLastSyncedAt(Date.now());

      channel = supabase
        .channel('planner_state_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: PLANNER_STATE_TABLE,
            filter: `id=eq.${PLANNER_STATE_ROW_ID}`,
          },
          (payload) => {
            if (!payload.new?.state) return;
            remoteUpdateRef.current = true;
            setState(payload.new.state);
            setLastSyncedAt(Date.now());
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (state === null) return;
    saveLocalCache(state);
    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false;
      return;
    }
    supabase
      .from(PLANNER_STATE_TABLE)
      .upsert({ id: PLANNER_STATE_ROW_ID, state, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (!error) setLastSyncedAt(Date.now());
      });
  }, [state]);

  const regenerate = useCallback(() => {
    setState((prev) => {
      const withRolledOver = { ...prev, tasks: applyRollover(prev.tasks, todayISO()) };
      const tasks = regenerateAutoTasks(withRolledOver);
      return { ...withRolledOver, tasks };
    });
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
    loading,
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
