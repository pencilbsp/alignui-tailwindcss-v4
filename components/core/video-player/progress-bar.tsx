"use client";

import { useCallback, useRef, HTMLAttributes, useState, useEffect } from "react";

import { cn } from "@/utils/cn";
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
    const containerRef = useRef<HTMLDivElement | null>(null);

    const duration = useVideoPlayer((state) => state.duration);
    // const hlsInstance = useVideoPlayer((state) => state.hlsInstance);
    const currentTime = useVideoPlayer((state) => state.currentTime);
    const videoElement = useVideoPlayer((state) => state.videoElement);

    const [bufferedRanges, setBufferedRanges] = useState({ start: 0, end: 0 });

    const [thumbPosition, setThumbPosition] = useState<{ x: number; y: number } | null>(null);

    // const safeValue = Math.min(duration, Math.max(currentTime, 0));

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

    // const debouncedHandleSeek = useDebounce(handleSeek, 100);

    // Xử lý Pointer Events
    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            e.preventDefault();
            // handleSeek(e.clientX);

            // Sử dụng Pointer Capture để nhận pointermove và pointerup trên cùng một phần tử
            const target = e.currentTarget;
            target.setPointerCapture(e.pointerId);

            const handlePointerMove = (moveEvent: PointerEvent) => {
                setThumbPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            };

            const handlePointerUp = () => {
                handleSeek(e.clientX);
                target.releasePointerCapture(e.pointerId);
                target.removeEventListener("pointerup", handlePointerUp);
                target.removeEventListener("pointermove", handlePointerMove);
            };

            target.addEventListener("pointerup", handlePointerUp);
            target.addEventListener("pointermove", handlePointerMove);
        },
        [handleSeek],
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

    if (duration === null) return null;

    return (
        <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            className={cn("flex h-2 w-full items-center", className)}
            {...rest}
        >
            <div className="bg-static-white/20 shadow-regular-md relative flex h-1 w-full cursor-pointer items-center hover:h-1.5 lg:h-1.5 lg:hover:h-2">
                <div
                    role="progressbar"
                    aria-valuemax={duration}
                    aria-valuenow={currentTime}
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                    className="bg-primary-base relative z-10 h-full transition-[width] ease-out"
                />

                <div
                    role="progressbar"
                    aria-valuemax={duration}
                    aria-valuenow={bufferedRanges.end}
                    style={{ width: `${(bufferedRanges.end / duration) * 100}%` }}
                    className="bg-static-white/50 absolute left-0 z-0 h-full transition-[width] ease-out"
                />

                <div className="bg-static-white invisible h-2 w-px opacity-0 hover:visible hover:opacity-100" />
            </div>
        </div>
    );
};

VideoPlayerProgressBar.displayName = "VideoPlayerProgressBar";

export default VideoPlayerProgressBar;
