import React from 'react';

export default function FormContainer({ onHandleInputChanges }) {
  return (
    <div className="max-w-2xl mx-auto bg-slate-900/40 border border-white/10 rounded-2xl p-6">
      <p className="text-gray-300 mb-4">Simple placeholder form (add fields as needed):</p>
      <div className="grid grid-cols-1 gap-3">
        <input
          type="text"
          placeholder="Interview Title"
          onChange={(e) => onHandleInputChanges('title', e.target.value)}
          className="rounded-2xl bg-slate-800 border border-white/10 px-4 py-2 text-white"
        />
        <input
          type="text"
          placeholder="Candidate Name"
          onChange={(e) => onHandleInputChanges('candidate', e.target.value)}
          className="rounded-2xl bg-slate-800 border border-white/10 px-4 py-2 text-white"
        />
        <button
          onClick={() => alert('This is a placeholder — implement steps as needed')}
          className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}
