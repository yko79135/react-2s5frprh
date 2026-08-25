import React from 'react';

const DAYS = ['월', '화', '수', '목', '금'];

// Real 2026 가을학기 교시별 시간표 — from "교사 Time Schedule_2026 가을" (Mr. Ko's row),
// Google Drive. This is a hand-copied snapshot, not an automated sync: if the school
// revises the schedule, this constant needs to be updated by hand to match.
const PERIODS = [
  {
    id: 'recite',
    label: '암송',
    time: '08:30–',
    subjects: { 월: null, 화: '암송', 수: '암송', 목: '암송', 금: '암송' },
  },
  {
    id: 'p1',
    label: '1교시',
    time: '09:00–09:40',
    subjects: { 월: '예배', 화: '성경강의', 수: 'Science (G9)', 목: 'Science Experiment (G7-12)', 금: null },
  },
  {
    id: 'p2',
    label: '2교시',
    time: '09:45–10:25',
    subjects: { 월: 'Math (G12)', 화: '성경강의', 수: null, 목: 'Science Experiment (G7-12)', 금: 'Science (G9)' },
  },
  {
    id: 'p3',
    label: '3교시',
    time: '10:30–11:10',
    subjects: { 월: 'Science (G5)', 화: 'Science (G12)', 수: 'Math (G9)', 목: 'Science (G5)', 금: 'Math (G9)' },
  },
  {
    id: 'p4',
    label: '4교시',
    time: '11:15–11:55',
    subjects: { 월: 'Math (G12)', 화: 'Science (G7E)', 수: 'Math (G12)', 목: 'Science (G12)', 금: 'Science (G7E)' },
  },
  { id: 'lunch', label: '점심', time: '12:00–13:05', lunch: true },
  {
    id: 'p5',
    label: '5교시',
    time: '13:05–13:45',
    subjects: { 월: 'Science (G7K)', 화: 'Math (G9)', 수: null, 목: '현장학습', 금: '발표' },
  },
  {
    id: 'p6',
    label: '6교시',
    time: '13:50–14:30',
    subjects: { 월: 'Science Experiment (G4-6)', 화: null, 수: null, 목: '현장학습', 금: 'C.A (G5-12)' },
  },
  {
    id: 'p7',
    label: '7교시',
    time: '14:35–15:15',
    subjects: { 월: 'Science Experiment (G4-6)', 화: 'Science (G7K)', 수: null, 목: '현장학습', 금: '홈룸' },
  },
  {
    id: 'p8',
    label: '8교시',
    time: '15:20–16:00',
    subjects: { 월: null, 화: 'Speaking (G5)', 수: null, 목: null, 금: null },
  },
];

const OTHER_SCHEDULE = [
  { label: '온라인 Science 진도 확인', detail: 'G7E · G9 · G12 — 화·수·목·금 당일 확인 (고정 교시 없음)' },
  { label: '금요철야', detail: '금요일 20:00–22:00' },
  { label: '교회 일정', detail: '일요일 09:00–16:00 (8월엔 13:30까지)' },
];

const Cell = ({ subject }) => (
  <td
    className={`border border-gray-200 px-2 py-2 text-center text-xs ${
      subject ? 'text-gray-800' : 'text-gray-300'
    }`}
  >
    {subject || '-'}
  </td>
);

const FallTimetable = () => (
  <div>
    <h2 className="mb-1 text-lg font-bold text-gray-900">2026 가을학기 시간표</h2>
    <p className="mb-3 text-xs text-gray-400">
      교사 Time Schedule_2026 가을 (Mr. Ko) 기준 교시별 시간표예요. 학교 시간표가 바뀌면 이 화면도
      손으로 다시 맞춰야 해요. (수요일 8교시 Musical Speaking G5-12는 8/25 구두로 전달받아 폐강
      처리했어요.)
    </p>
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-16" />
          <col className="w-24" />
          {DAYS.map((d) => (
            <col key={d} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="border border-gray-700 px-2 py-2 text-xs font-semibold">교시</th>
            <th className="border border-gray-700 px-2 py-2 text-xs font-semibold">시간</th>
            {DAYS.map((d) => (
              <th key={d} className="border border-gray-700 px-2 py-2 text-xs font-semibold">
                {d}요일
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((p) => (
            <tr key={p.id} className={p.lunch ? 'bg-gray-50' : ''}>
              <td className="border border-gray-200 px-2 py-2 text-center text-xs font-semibold text-gray-700">
                {p.label}
              </td>
              <td className="border border-gray-200 px-2 py-2 text-center text-[11px] text-gray-400">
                {p.time}
              </td>
              {p.lunch ? (
                <td
                  colSpan={DAYS.length}
                  className="border border-gray-200 px-2 py-2 text-center text-xs text-gray-400"
                >
                  점심시간
                </td>
              ) : (
                DAYS.map((d) => <Cell key={d} subject={p.subjects[d]} />)
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-bold text-gray-900">교시에 없는 고정 일정</h3>
      <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
        {OTHER_SCHEDULE.map((s) => (
          <li
            key={s.label}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0"
          >
            <span className="font-medium text-gray-800">{s.label}</span>
            <span className="text-gray-400">{s.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default FallTimetable;
