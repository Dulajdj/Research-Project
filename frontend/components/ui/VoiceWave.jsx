export default function VoiceWave({ active }) {
  return (
    <div className="flex space-x-1 mt-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-6 bg-green-400 rounded 
          ${active ? "animate-bounce" : ""}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}