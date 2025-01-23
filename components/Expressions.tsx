"use client";

import { expressionColors, isExpressionColor } from "@/services/hume/expressions/expressionColors";
import { expressionLabels } from "@/services/hume/expressions/expressionLabels";
import { motion } from "framer-motion";
import { CSSProperties } from "react";
import * as R from "remeda";

const barStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  borderRadius: "9999px"
} as const;

export default function Expressions({
  values,
}: {
  values: Record<string, number>;
}) {
  // Ensure all values are valid numbers
  const safeValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === 'number' && !isNaN(value) ? value : 0])
  );

  const top3 = R.pipe(
    safeValues,
    R.entries(),
    R.sortBy(R.pathOr([1], 0)),
    R.reverse(),
    R.take(3)
  );

  return (
    <div
      className={
        "text-xs p-3 w-full border-t border-border flex flex-col md:flex-row gap-3"
      }
    >
      {top3.map(([key, value]) => (
        <div key={key} className={"w-full overflow-hidden"}>
          <div
            className={"flex items-center justify-between gap-1 font-mono pb-1"}
          >
            <div className={"font-medium truncate"}>
              {expressionLabels[key]}
            </div>
            <div className={"tabular-nums opacity-50"}>{value.toFixed(2)}</div>
          </div>
          <div
            className={"relative h-1"}
            style={
              {
                "--bg": isExpressionColor(key)
                  ? expressionColors[key]
                  : "var(--bg)",
              } as CSSProperties
            }
          >
            <div
              className={
                "absolute top-0 left-0 size-full rounded-full opacity-10 bg-[var(--bg)]"
              }
            />
            <motion.div
              style={{
                ...barStyle,
                background: "var(--bg)"
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${R.pipe(
                  value,
                  R.clamp({ min: 0, max: 1 }),
                  (value) => `${value * 100}%`
                )}`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
