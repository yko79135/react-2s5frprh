import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { CATEGORIES, PRIORITY_LABELS } from '../lib/categories';
import { formatMD } from '../lib/dateUtils';

const TaskRow = ({ task, onToggle, onDelete, onUpdateNotes, showDate }) => {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORIES[task.category] || CATEGORIES.other;
  const priority = task.category === 'urgent' ? 'urgent' : task.priority;

  return (
    <div className={`rounded-lg border ${cat.border} ${task.done ? 'bg-white' : cat.bg} transition-colors`}>
      <div className="flex items-start gap-2 p-2.5">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
            task.done ? 'border-gray-400 bg-gray-400' : `${cat.border} bg-white`
          }`}
          aria-label={task.done ? '완료 취소' : '완료로 표시'}
        >
          {task.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-sm font-medium ${task.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}
            >
              {task.title}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${cat.chip}`}>
              {cat.label}
            </span>
            {priority !== 'normal' && (
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                  priority === 'urgent' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {PRIORITY_LABELS[priority]}
              </span>
            )}
            {showDate && (
              <span className="text-[11px] text-gray-500">{formatMD(task.date)}</span>
            )}
            {task.rolledOver && !task.done && (
              <span className="text-[11px] text-gray-400">↻ 이월됨</span>
            )}
            {task.project && (
              <span className="text-[11px] text-gray-400">{task.project}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100"
          aria-label="메모 펼치기"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
          aria-label="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-2.5 pt-2">
          <textarea
            value={task.notes}
            onChange={(e) => onUpdateNotes(task.id, e.target.value)}
            placeholder="메모 추가..."
            className="w-full resize-none rounded border border-gray-200 p-1.5 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
            rows={2}
          />
        </div>
      )}
    </div>
  );
};

export default TaskRow;
