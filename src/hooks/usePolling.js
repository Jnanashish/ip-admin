import { useState, useEffect, useRef, useCallback } from "react";

export function usePolling({ callback, interval = 30000, maxIterations = 10, enabled = false }) {
    const [isPolling, setIsPolling] = useState(false);
    const [iterationCount, setIterationCount] = useState(0);
    const intervalRef = useRef(null);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
        setIterationCount(0);
    }, []);

    useEffect(() => {
        if (!enabled) {
            stop();
            return;
        }

        setIsPolling(true);
        setIterationCount(0);
        let count = 0;

        intervalRef.current = setInterval(() => {
            count++;
            setIterationCount(count);
            callback();

            if (count >= maxIterations) {
                stop();
            }
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, maxIterations, callback, stop]);

    return { isPolling, iterationCount, stop };
}
