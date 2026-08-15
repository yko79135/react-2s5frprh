import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';

const AddTaskForm = ({ defaultDate, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(defaultDate);
  const [priority, setPriority] = useState('normal');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), category, date, priority });
    setTitle('');
    setCategory('other');
    setPriority('normal');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setDate(defaultDate);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" /> 할 일 추가
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">새 할 일</span>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일 제목"
        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
      />
      <div className="grid grid-cols-3 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-500 focus:outline-none"
        >
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <option key={key} value={key}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-500 focus:outline-none"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-500 focus:outline-none"
        >
          <option value="normal">일반</option>
          <option value="deadline">마감임박</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full rounded bg-gray-900 py-1.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        추가
      </button>
    </form>
  );
};

export default AddTaskForm;
