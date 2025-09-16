"use client";

export default function EvalBar({ eval: evaluation, mateIn, orientation }) {
  const clampedEval = Math.max(-10, Math.min(10, evaluation));

  let whitePercent = ((clampedEval + 10) / 20) * 100;

  if (mateIn < 0) {
    whitePercent = 0;
  } else if (mateIn > 0) {
    whitePercent = 100;
  }

  return (
    <div
      className={`select-none relative w-5 h-full rounded-sm overflow-hidden border border-gray-600 bg-gray-800 flex ${orientation == "white" ? "flex-col-reverse" : "flex-col"}`}
    >
      <div
        className="bg-white transition-all duration-300"
        style={{ height: `${whitePercent}%` }}
      />
      <div
        className="bg-stone-800 transition-all duration-300"
        style={{ height: `${100 - whitePercent}%` }}
      />
      <div className="w-full text-[9px] mix-blend-difference bottom-0 absolute mb-0.5 flex flex-col items-center justify-center">
        {Math.abs(mateIn) == 999 ? (
          <div>M</div>
        ) : mateIn > 0 ? (
          <>
            <div>M</div>
            <div>{Math.abs(mateIn)}</div>
          </>
        ) : mateIn < 0 ? (
          <>
            <div>M</div>
            <div>{Math.abs(mateIn)}</div>
          </>
        ) : (
          clampedEval.toFixed(1)
        )}
      </div>
    </div>
  );
}
