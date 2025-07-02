"use client";

export default function EvalBar({ eval: evaluation }) {
  const clampedEval = Math.max(-10, Math.min(10, evaluation));

  const whitePercent = ((clampedEval + 10) / 20) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-8 h-full min-h-[300px] relative">
      <div className="w-full h-full rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-800 flex flex-col-reverse">
        <div
          className="bg-white transition-all duration-300"
          style={{ height: `${whitePercent}%` }}
        />
        <div
          className="bg-black transition-all duration-300"
          style={{ height: `${100 - whitePercent}%` }}
        />
      </div>

      <div className="text-xs mt-1 text-gray-700 dark:text-gray-300">
        {clampedEval > 9.9
          ? "M1+"
          : clampedEval < -9.9
            ? "M1-"
            : clampedEval.toFixed(1)}
      </div>
    </div>
  );
}
