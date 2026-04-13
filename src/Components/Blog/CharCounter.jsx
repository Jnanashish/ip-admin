import React from "react";
import { cn } from "../../lib/utils";

const CharCounter = ({ current, max }) => {
    const ratio = max > 0 ? current / max : 0;
    return (
        <span
            className={cn(
                "text-xs tabular-nums",
                ratio > 1
                    ? "text-destructive font-medium"
                    : ratio > 0.8
                      ? "text-amber-600"
                      : "text-muted-foreground"
            )}
        >
            {current}/{max}
        </span>
    );
};

export default CharCounter;
