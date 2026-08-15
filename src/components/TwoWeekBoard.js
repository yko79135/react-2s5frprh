import React from 'react';
import { Check } from 'lucide-react';
import { CATEGORIES, sortTasks } from '../lib/categories';
import { addDays, dateRange, formatMD, todayISO, weekdayLabel } from '../lib/dateUtils';
import { getFixedScheduleForDate } from '../lib/planner';
import AddTaskForm from './AddTaskForm';

const MiniTask = ({ task, onToggle }) => {
  const cat = CATEGORIES[task.category] || CATEGORIES.other;
  return (
    <button
      onClick={() => onToggle(task.id)}
      className={`flex w-full items-start gap-1.5 rounded px-1.5 py-1 text-left text-xs ${
        task.done ? 'bg-white' : cat.bg
      }`}
    >
      <span
        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
          task.done ? 'border-gray-400 bg-gray-400' : cat.border
        }`}
      >
        {task.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
      </span>
      <span className={`leading-tight ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {task.title}
      </span>
    </button>
  );
};

const DayColumn = ({ iso, tasks, onToggle, onAdd, isToday }) => {
  const dayTasks = sortTasks(tasks.filter((t) => t.date === iso));
  const fixed = getFixedScheduleForDate(iso);

  return (
    <div
      className={`flex w-56 shrink-0 flex-col rounded-lg border ${
        isToday ? 'border-gray-900' : 'border-gray-200'
      } bg-white`}
    >
      <div className={`rounded-t-lg px-2.5 py-2 ${isToday ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'}`}>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold">{formatMD(iso)}</span>
          <span className="text-xs opacity-80">{weekdayLabel(iso)}요일</span>
        </div>
        {fixed.length > 0 && (
          <div className={`mt-0.5 text-[10px] ${isToday ? 'text-gray-300' : 'text-gray-400'}`}>
            {fixed.map((f) => f.label).join(' · ')}
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1 p-2">
        {dayTasks.length === 0 && <div className="py-2 text-center text-[11px] text-gray-300">-</div>}
        {dayTasks.map((t) => (
          <MiniTask key={t.id} task={t} onToggle={onToggle} />
        ))}
      </div>
      <div className="p-2 pt-0">
        <AddTaskForm defaultDate={iso} onAdd={onAdd} />
      </div>
    </div>
  );
};

const TwoWeekBoard = ({ tasks, onToggle, onAdd }) => {
  const today = todayISO();
  const days = dateRange(today, addDays(today, 13));

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-gray-900">다가오는 2주</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {days.map((iso) => (
          <DayColumn
            key={iso}
            iso={iso}
            tasks={tasks}
            onToggle={onToggle}
            onAdd={onAdd}
            isToday={iso === today}
          />
        ))}
      </div>
    </div>
  );
};

export default TwoWeekBoard;
