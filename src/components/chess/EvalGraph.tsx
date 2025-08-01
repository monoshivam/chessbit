"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
} from "recharts";

function EvalGraph({ analysisData }) {
  console.log(analysisData);
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
  console.log(processedData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        data={processedData}
      >
        <YAxis domain={[0, 100]} hide />
        <Area
          type="bumpX"
          dataKey="evaluation"
          fill="white"
          stroke="white"
          fillOpacity={1}
        />
        <ReferenceLine y={50} stroke="#666360" strokeWidth={1} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default React.memo(EvalGraph);
