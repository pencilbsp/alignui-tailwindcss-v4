"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import {
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/video-player";

import VideoProgressBar from "../core/video-progress-bar";
import { VideoPlayerSettings } from "./video-player-settings";
import { PlayerAction, useVideoPlayer } from "./video-player-provider";

const VideoPlayerControls = memo(() => {
    const controlsRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<number | null>(null);

    const {
        mute,
        status,
        duration,
        controls,
        isPlaying,
        handlePlay,
        fullscreen,
        handleSeek,
        handleMute,
        currentTime,
        dispatch,
        handleFullScreen,
        containerElement,
    } = useVideoPlayer();

    useEffect(() => {
        if (!controlsRef.current || !containerElement) return;

        const updateControls = () => {
            if (!controlsRef.current || !containerElement) return;

            const height = controlsRef.current.getBoundingClientRect().height;
            const containerHeight = containerElement.getBoundingClientRect().height;
            controlsRef.current.style.setProperty("--controls-height", `${height}px`);
            controlsRef.current.style.setProperty("--container-height", `${containerHeight}px`);
        };

        const resizeObserver = new ResizeObserver(updateControls);

        resizeObserver.observe(controlsRef.current);

        updateControls();

        return () => {
            resizeObserver.disconnect();

            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [containerElement]);

    // Xử lý ẩn hiện controls sau khoảng thời gian không tương tác
    useEffect(() => {
        const controlsElement = controlsRef.current;
        if (!controlsElement || !containerElement || ["loading", "paused"].includes(status)) return;

        const resetHideTimeout = (event: MouseEvent | TouchEvent | PointerEvent) => {
            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }

            dispatch({ type: PlayerAction.SET_CONTROLS, payload: true });

            if (controlsRef.current && controlsRef.current.contains(event.target)) {
                return;
            }

            hideTimeoutRef.current = window.setTimeout(() => {
                dispatch({ type: PlayerAction.SET_CONTROLS, payload: false });
            }, 2000);
        };

        controlsElement.addEventListener("mousemove", resetHideTimeout);
        controlsElement.addEventListener("touchstart", resetHideTimeout);
        containerElement.addEventListener("pointermove", resetHideTimeout);
        containerElement.addEventListener("pointerleave", resetHideTimeout);

        return () => {
            controlsElement.removeEventListener("mousemove", resetHideTimeout);
            controlsElement.removeEventListener("touchstart", resetHideTimeout);
            containerElement.removeEventListener("pointermove", resetHideTimeout);
            containerElement.removeEventListener("pointerleave", resetHideTimeout);

            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [status, containerElement, dispatch]);

    return (
        <div
            ref={controlsRef}
            className={cn(
                "from-static-black/40 absolute bottom-0 left-0 flex w-full flex-col gap-3 bg-gradient-to-t to-transparent px-4 pb-3 transition-all duration-300 lg:gap-4",
                !controls && "invisible opacity-0",
            )}
        >
            {duration !== null && <VideoProgressBar onSeek={handleSeek} max={duration} value={currentTime} />}

            <div className="flex justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                    <button type="button" onClick={handlePlay} aria-label="Pause Button" className="cursor-pointer">
                        {isPlaying ? (
                            <PauseIcon className="size-6 lg:size-8" />
                        ) : (
                            <PlayIcon className="size-6 lg:size-8" />
                        )}
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleMute}
                            className="cursor-pointer"
                            aria-label={mute ? "Unmute" : "Mute"}
                        >
                            {mute ? (
                                <SpeakerXMarkIcon className="size-6 lg:size-8" />
                            ) : (
                                <SpeakerWaveIcon className="size-6 lg:size-8" />
                            )}
                        </button>
                    </div>

                    {duration !== null && (
                        <div className="text-subheading-sm lg:text-subheading-lg flex items-center gap-1">
                            <span>{formatTime(currentTime).timeString}</span>
                            <span>/</span>
                            <span>{formatTime(duration).timeString}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 lg:gap-4">
                    <VideoPlayerSettings />

                    <button
                        type="button"
                        className="cursor-pointer"
                        onClick={handleFullScreen}
                        aria-label={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {fullscreen ? (
                            <ArrowsPointingInIcon className="size-6 lg:size-8" />
                        ) : (
                            <ArrowsPointingOutIcon className="size-6 lg:size-8" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});
VideoPlayerControls.displayName = "VideoPlayerControls";

export default VideoPlayerControls;
