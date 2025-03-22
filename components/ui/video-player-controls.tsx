"use client";

import { memo, useEffect, useRef } from "react";
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

import { useVideoPlayer } from "./video-player-provider";
import VideoProgressBar from "../core/video-progress-bar";
import { VideoPlayerSettings } from "./video-player-settings";

const VideoPlayerControls = memo(() => {
    const controlsRef = useRef<HTMLDivElement>(null);

    const {
        mute,
        controls,
        duration,
        isPlaying,
        handlePlay,
        fullscreen,
        handleSeek,
        handleMute,
        currentTime,
        handleFullScreen,
        containerElement,
    } = useVideoPlayer();

    useEffect(() => {
        if (!controlsRef.current) return;

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

        return () => resizeObserver.disconnect();
    }, [containerElement]);

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
