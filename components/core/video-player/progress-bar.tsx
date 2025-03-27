"use client";

import { useCallback, useRef, HTMLAttributes, useState, useEffect, PointerEvent } from "react";

import { cn } from "@/utils/cn";
import { formatTime } from "./time";
import { useVideoPlayer } from "./store";

function timeRangesParsed(timeRanges: TimeRanges) {
    const range = { start: 0, end: 0 };

    if (timeRanges.length > 0) {
        range.start = timeRanges.start(0);
        range.end = timeRanges.end(timeRanges.length - 1);
    }

    return range;
}

const VideoPlayerProgressBar = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => {
    const thumbRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const duration = useVideoPlayer((state) => state.duration);
    const currentTime = useVideoPlayer((state) => state.currentTime);
    const videoElement = useVideoPlayer((state) => state.videoElement);

    const [bufferedRanges, setBufferedRanges] = useState({ start: 0, end: 0 });

    const [thumbPosition, setThumbPosition] = useState<{ x: number; time: number } | null>(null);

    // Tính toán giá trị seek dựa trên vị trí clientX
    const handleSeek = useCallback(
        (clientX: number) => {
            if (videoElement && containerRef.current && duration !== null) {
                const rect = containerRef.current.getBoundingClientRect();
                const newValue = ((clientX - rect.left) / rect.width) * duration;
                videoElement.currentTime = Math.min(duration, Math.max(newValue, 0));
            }
        },
        [duration, videoElement],
    );

    const handlePointerUp = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            target.releasePointerCapture(e.pointerId);
            handleSeek(e.clientX);
        },
        [handleSeek],
    );

    const handlePointerCancel = useCallback((e: PointerEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        target.releasePointerCapture(e.pointerId);
    }, []);

    const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            if (!containerRef.current || !thumbRef.current || duration === null) return;

            const thumbRect = thumbRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            const clientX = e.clientX - containerRect.x;
            const leftPos = Math.min(Math.max(0, clientX - thumbRect.width / 2), containerRect.width - thumbRect.width);

            const time = Math.max(0, (clientX / containerRect.width) * duration);

            setThumbPosition({ x: leftPos, time });
        },
        [duration],
    );

    // useEffect(() => {
    //     if (!hlsInstance) return;

    //     hlsInstance.on(Hls.Events.BUFFER_APPENDED, () => {
    //         console.log("Buffer appended");
    //     });
    // }, [hlsInstance]);

    useEffect(() => {
        if (!videoElement) return;

        const handleProgress = () => setBufferedRanges(timeRangesParsed(videoElement.buffered));

        videoElement.addEventListener("progress", handleProgress);

        return () => videoElement.removeEventListener("progress", handleProgress);
    }, [videoElement]);

    return (
        <div ref={containerRef} className={cn("relative flex h-2 w-full items-center", className)} {...rest}>
            <div
                ref={thumbRef}
                // initial={{ y: 10, opacity: 0 }}
                style={{ left: thumbPosition?.x }}
                // animate={thumbPosition ? { y: 0, opacity: 1, transition: { duration: 0.2 } } : { y: 10, opacity: 0 }}
                className={cn(
                    "bg-static-black/80 shadow-regular-xs absolute bottom-full -translate-y-3 rounded-lg px-3 py-1 ring ring-neutral-200/20 ring-inset",
                    !thumbPosition && "invisible",
                )}
            >
                {formatTime(thumbPosition?.time || 0)}
            </div>
            <div
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                // onPointerEnter={handlePointerMove}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={() => setThumbPosition(null)}
                className="bg-static-white/20 shadow-regular-md relative flex h-1 w-full cursor-pointer items-center overflow-hidden hover:h-1.5 lg:h-1.5 lg:hover:h-2"
            >
                <div
                    role="progressbar"
                    aria-valuemax={duration || 0}
                    aria-valuenow={currentTime}
                    style={{ width: duration !== null ? `${(currentTime / duration) * 100}%` : 0 }}
                    className="bg-primary-base relative z-10 h-full transition-[width] ease-out"
                />

                <div
                    role="progressbar"
                    aria-valuemax={duration || 0}
                    aria-valuenow={bufferedRanges.end}
                    style={{ width: duration !== null ? `${(bufferedRanges.end / duration) * 100}%` : 0 }}
                    className="bg-static-white/50 absolute left-0 z-0 h-full transition-[width] ease-out"
                />
            </div>
        </div>
    );
};

VideoPlayerProgressBar.displayName = "VideoPlayerProgressBar";

export default VideoPlayerProgressBar;
