export default function VideoCard({ emoji, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-52 h-52 rounded-3xl bg-black flex items-center justify-center text-6xl shadow-2xl border-4 border-purple-600">
        {emoji}
      </div>
      <p className="mt-4 text-white text-lg">{label}</p>
    </div>
  );
}