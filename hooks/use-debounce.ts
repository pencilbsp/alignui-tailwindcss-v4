"use client";

import { useCallback, useRef } from "react";

const useDebounce = (callback: (args: unknown[]) => void, delay: number) => {
    const timeoutRef = useRef<(ReturnType<typeof setTimeout> | number) | null>(null);

    return useCallback(
        (args: unknown[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(args);
            }, delay);
        },
        [callback, delay],
    );
};

export default useDebounce;
