import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { CATEGORIES, sortTasks } from '../lib/categories';
import { addDays, dateRange, formatMD, todayISO, weekdayLabel } from '../lib/dateUtils';
import { getFixedScheduleForDate } from '../lib/planner';
import AddTaskForm from './AddTaskForm';

const MiniTask = ({ task, onToggle, onDragStart, onDragEnd, isDragging }) => {
  const cat = CATEGORIES[task.category] || CATEGORIES.other;
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      className={`flex w-full cursor-grab items-start gap-1.5 rounded px-1.5 py-1 text-left text-xs active:cursor-grabbing ${
        task.done ? 'bg-white' : cat.bg
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
          task.done ? 'border-gray-400 bg-gray-400' : cat.border
        }`}
        aria-label={task.done ? '완료 취소' : '완료로 표시'}
      >
        {task.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
      </button>
      <span className={`leading-tight ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {task.title}
      </span>
    </div>
  );
};

const DayColumn = ({ iso, tasks, onToggle, onAdd, isToday, draggedId, onDragStart, onDragEnd, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dayTasks = sortTasks(tasks.filter((t) => t.date === iso));
  const fixed = getFixedScheduleForDate(iso);

  return (
    <div
      onDragOver={(e) => {
        if (!draggedId) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(iso);
      }}
      className={`flex w-56 shrink-0 flex-col rounded-lg border ${
        isDragOver ? 'border-gray-900 ring-2 ring-gray-900/20' : isToday ? 'border-gray-900' : 'border-gray-200'
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
        {dayTasks.length === 0 && (
          <div className="py-2 text-center text-[11px] text-gray-300">
            {isDragOver ? '여기로 이동' : '-'}
          </div>
        )}
        {dayTasks.map((t) => (
          <MiniTask
            key={t.id}
            task={t}
            onToggle={onToggle}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggedId === t.id}
          />
        ))}
      </div>
      <div className="p-2 pt-0">
        <AddTaskForm defaultDate={iso} onAdd={onAdd} />
      </div>
    </div>
  );
};

const TwoWeekBoard = ({ tasks, onToggle, onAdd, onMove }) => {
  const today = todayISO();
  const days = dateRange(today, addDays(today, 13));
  const [draggedId, setDraggedId] = useState(null);

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-gray-900">다가오는 2주</h2>
      <p className="mb-3 text-xs text-gray-400">할 일을 다른 날짜 칸으로 끌어다 놓으면 일정이 바뀝니다.</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {days.map((iso) => (
          <DayColumn
            key={iso}
            iso={iso}
            tasks={tasks}
            onToggle={onToggle}
            onAdd={onAdd}
            isToday={iso === today}
            draggedId={draggedId}
            onDragStart={setDraggedId}
            onDragEnd={() => setDraggedId(null)}
            onDrop={(iso) => {
              if (draggedId) onMove(draggedId, iso);
              setDraggedId(null);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TwoWeekBoard;
