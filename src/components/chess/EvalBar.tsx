"use client";

export default function EvalBar({ eval: evaluation, orientation }) {
  const clampedEval = Math.max(-10, Math.min(10, evaluation));

  const whitePercent = ((clampedEval + 10) / 20) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-8 h-full min-h-[300px] relative">
      <div
        className={`w-full h-full rounded-md overflow-hidden border border-gray-600 bg-gray-800 flex ${orientation == "white" ? "flex-col-reverse" : "flex-col"}`}
      >
        <div
          className="bg-white transition-all duration-300"
          style={{ height: `${whitePercent}%` }}
        />
        <div
          className="bg-stone-800 transition-all duration-300"
          style={{ height: `${100 - whitePercent}%` }}
        />
        <div className="text-xs text-neutral-800 absolute ml-1.5 mb-1 mt-1">
          {clampedEval > 9.9
            ? "M1+"
            : clampedEval < -9.9
              ? "M1-"
              : clampedEval.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
