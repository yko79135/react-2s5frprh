import React, { useState } from 'react';
import { CalendarDays, ListTodo, Settings as SettingsIcon } from 'lucide-react';
import { usePlanner } from './lib/store';
import TodayView from './components/TodayView';
import TwoWeekBoard from './components/TwoWeekBoard';
import SettingsPanel from './components/SettingsPanel';

const TABS = [
  { id: 'today', label: '오늘', icon: ListTodo },
  { id: 'board', label: '2주 보기', icon: CalendarDays },
  { id: 'settings', label: '설정', icon: SettingsIcon },
];

const App = () => {
  const {
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
  } = usePlanner();

  const [tab, setTab] = useState('today');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <h1 className="text-base font-bold text-gray-900">2026 Fall 수업 준비 계획표</h1>
          <p className="text-xs text-gray-400">교과 1–2영업일 전 · 비교과 5–7일 전 · 자동 2주 준비 계획</p>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${
                tab === id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        {tab === 'today' && (
          <TodayView
            tasks={state.tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdateNotes={(id, notes) => updateTask(id, { notes })}
            onAdd={addTask}
          />
        )}
        {tab === 'board' && <TwoWeekBoard tasks={state.tasks} onToggle={toggleTask} onAdd={addTask} />}
        {tab === 'settings' && (
          <SettingsPanel
            state={state}
            lastSyncedAt={lastSyncedAt}
            onRegenerate={regenerate}
            setCourses={setCourses}
            setReviewProjects={setReviewProjects}
            setExcludedDates={setExcludedDates}
            setExerciseWeekdays={setExerciseWeekdays}
            onImport={importState}
            onReset={resetToSeed}
          />
        )}
      </main>
    </div>
  );
};

export default App;
