"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
} from "recharts";

function EvalGraph({
  analysisData,
  verdicts,
  moveClick,
  currMoveIndex,
  boardOrientation,
}) {
  // console.log(analysisData);

  const orien = boardOrientation == "white" ? false : true;

  const InteractiveDot = (props) => {
    const { cx, cy, index } = props;
    // console.log(index);
    // console.log(verdicts);

    const sw = index - 1 == currMoveIndex ? 2 : 0;

    const color =
      verdicts[index - 1] == "blunder"
        ? "#fa412d"
        : verdicts[index - 1] == "mistake"
          ? "#ffa459"
          : verdicts[index - 1] == "inaccuracy"
            ? "#56b4e9"
            : "#000000";

    let dispRad;

    if (index == 0 || index == analysisData.length - 1) {
      dispRad = 0;
    } else if (!orien && (index - 1) % 2 == 0) {
      if (
        verdicts[index - 1] == "blunder" ||
        verdicts[index - 1] == "mistake" ||
        verdicts[index - 1] == "inaccuracy"
      ) {
        dispRad = 5;
      } else dispRad = 0;
    } else if (orien && (index - 1) % 2 != 0) {
      if (
        verdicts[index - 1] == "blunder" ||
        verdicts[index - 1] == "mistake" ||
        verdicts[index - 1] == "inaccuracy"
      ) {
        dispRad = 5;
      } else dispRad = 0;
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={dispRad}
        fill={color}
        stroke="#1c1917"
        strokeWidth={sw}
        onClick={() => moveClick(analysisData[index].fen, index - 1)}
        style={{ cursor: "pointer" }}
      />
    );
  };

  const processedData = analysisData.map((item) => {
    if (Number(item.mate) < 0) {
      const evaluation = 0;
      return { evaluation };
    } else if (Number(item.mate) > 0) {
      const evaluation = 100;
      return { evaluation };
    }
    const clampedEval = Math.max(-10, Math.min(10, item.eval));
    // const evaluation = (clampedEval + 10) / 2;
    const evaluation = (clampedEval + 10) * 5;

    return {
      evaluation,
    };
  });
  processedData[0].evaluation = 50;
  // console.log(processedData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        data={processedData}
      >
        <YAxis domain={[0, 100]} hide reversed={orien} />
        <Area
          type="bumpX"
          dataKey="evaluation"
          fill="white"
          stroke="white"
          fillOpacity={1}
          dot={<InteractiveDot />}
          activeDot={false}
          animationDuration={700}
        />
        <ReferenceLine y={50} stroke="#666360" strokeWidth={1} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default React.memo(EvalGraph);
