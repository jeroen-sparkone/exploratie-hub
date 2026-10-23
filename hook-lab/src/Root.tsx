import React from "react";
import { Composition } from "remotion";
import { Hook, Variant } from "./Hook";

const VARIANTS: Variant[] = ["origineel", "mask-reveal", "count-up", "impact"];

export const Root: React.FC = () => (
  <>
    {VARIANTS.map((v) => (
      <Composition key={v} id={`hook-${v}`} component={Hook} defaultProps={{ variant: v }}
        durationInFrames={180} fps={30} width={1080} height={1920} />
    ))}
  </>
);
