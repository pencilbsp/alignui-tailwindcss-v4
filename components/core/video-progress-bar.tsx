"use client";

// AlignUI ProgressBar v0.0.0
import { useCallback, forwardRef, useRef } from "react";

import useDebounce from "@/hooks/use-debounce";

import { tv, type VariantProps } from "tailwind-variants";

export const progressBarVariants = tv({
    slots: {
        progress: "h-full transition-[width] ease-out",
        buffered: "bg-bg-soft-200 h-full transition-[width] ease-out",
        root: "bg-static-white/20 shadow-regular-md h-1 w-full cursor-pointer hover:h-1.5 lg:h-1.5 lg:hover:h-2",
    },
    variants: {
        color: {
            blue: {
                progress: "bg-information-base",
            },
            red: {
                progress: "bg-error-base",
            },
            orange: {
                progress: "bg-warning-base",
            },
            green: {
                progress: "bg-success-base",
            },
        },
    },
    defaultVariants: {
        color: "blue",
    },
});

type ProgressBarRootProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof progressBarVariants> & {
        max?: number;
        value?: number;
        buffered?: number;
        onSeek: (value: number) => void; // Callback để thông báo giá trị seek mới
    };

const VideoProgressBar = forwardRef<HTMLDivElement, ProgressBarRootProps>(
    ({ className, color, value = 0, max = 100, onSeek, ...rest }, forwardedRef) => {
        const { root, progress } = progressBarVariants({ color });
        const safeValue = Math.min(max, Math.max(value, 0));

        const containerRef = useRef<HTMLDivElement | null>(null);

        const debounceSeek = useDebounce(onSeek, 200);

        // Tính toán giá trị seek dựa trên vị trí clientX
        const handleSeek = useCallback(
            (clientX: number) => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    let newValue = ((clientX - rect.left) / rect.width) * max;
                    newValue = Math.min(max, Math.max(newValue, 0));
                    debounceSeek(newValue);
                }
            },
            [max, debounceSeek],
        );

        // Xử lý Pointer Events
        const handlePointerDown = useCallback(
            (e: React.PointerEvent<HTMLDivElement>) => {
                e.preventDefault();
                handleSeek(e.clientX);

                // Sử dụng Pointer Capture để nhận pointermove và pointerup trên cùng một phần tử
                const target = e.currentTarget;
                target.setPointerCapture(e.pointerId);

                const handlePointerMove = (moveEvent: PointerEvent) => {
                    handleSeek(moveEvent.clientX);
                };

                const handlePointerUp = () => {
                    target.releasePointerCapture(e.pointerId);
                    target.removeEventListener("pointermove", handlePointerMove);
                    target.removeEventListener("pointerup", handlePointerUp);
                };

                target.addEventListener("pointermove", handlePointerMove);
                target.addEventListener("pointerup", handlePointerUp);
            },
            [handleSeek],
        );

        return (
            <div
                ref={(node) => {
                    containerRef.current = node;
                    if (typeof forwardedRef === "function") {
                        forwardedRef(node);
                    } else if (forwardedRef) {
                        forwardedRef.current = node;
                    }
                }}
                onPointerDown={handlePointerDown}
                className="flex h-3 w-full items-center"
            >
                <div className={root({ class: className })} {...rest}>
                    <div
                        role="progressbar"
                        aria-valuemax={max}
                        aria-valuenow={value}
                        className={progress()}
                        style={{ width: `${(safeValue / max) * 100}%` }}
                    />
                </div>
            </div>
        );
    },
);

VideoProgressBar.displayName = "VideoProgressBar";

export default VideoProgressBar;
