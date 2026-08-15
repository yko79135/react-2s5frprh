import React from 'react';
import { sortTasks } from '../lib/categories';
import { formatMDDow, todayISO } from '../lib/dateUtils';
import { getFixedScheduleForDate } from '../lib/planner';
import TaskRow from './TaskRow';
import AddTaskForm from './AddTaskForm';

const TodayView = ({ tasks, onToggle, onDelete, onUpdateNotes, onAdd }) => {
  const today = todayISO();
  const todayTasks = sortTasks(tasks.filter((t) => t.date === today));
  const done = todayTasks.filter((t) => t.done).length;
  const fixed = getFixedScheduleForDate(today);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{formatMDDow(today)} 오늘 할 일</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          {todayTasks.length === 0 ? '오늘 등록된 할 일이 없어요.' : `${done}/${todayTasks.length}개 완료`}
        </p>
        {fixed.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fixed.map((f) => (
              <span
                key={f.id}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500"
              >
                {f.label} · {f.time}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {todayTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdateNotes={onUpdateNotes}
          />
        ))}
      </div>

      <div className="mt-3">
        <AddTaskForm defaultDate={today} onAdd={onAdd} />
      </div>
    </div>
  );
};

export default TodayView;
