import { memo, useEffect, useRef } from "react";
import {
    PlayIcon,
    PauseIcon,
    SpeakerXMarkIcon,
    SpeakerWaveIcon,
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/utils/cn";

import VideoPlayerSettings from "./settings";
import VideoProgressBar from "./progress-bar";
import { useVideoPlayer, State } from "./store";

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");

    return minutes + ":" + seconds;
};

const VideoPlayerControls = memo(() => {
    const controlsRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<number | null>(null);
    // console.log("rendering VideoPlayerControls...");

    const mute = useVideoPlayer((state) => state.mute);
    const state = useVideoPlayer((state) => state.state);
    const duration = useVideoPlayer((state) => state.duration);
    const toggleMute = useVideoPlayer((state) => state.toggleMute);
    const togglePlay = useVideoPlayer((state) => state.togglePlay);
    const fullScreen = useVideoPlayer((state) => state.fullScreen);
    const currentTime = useVideoPlayer((state) => state.currentTime);
    const settingsVisible = useVideoPlayer((state) => state.settingsVisible);
    const controlsVisible = useVideoPlayer((state) => state.controlsVisible);
    const containerElement = useVideoPlayer((state) => state.containerElement);
    const toggleFullScreen = useVideoPlayer((state) => state.toggleFullScreen);
    const setControlsVisible = useVideoPlayer((state) => state.setControlsVisible);

    // Xử lý ẩn hiện controls sau khoảng thời gian không tương tác
    useEffect(() => {
        if (!containerElement || [State.LOADING, State.PAUSED].includes(state)) {
            return;
        }

        const resetHideTimeout = () => {
            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }

            setControlsVisible(true);

            if (settingsVisible) return;

            hideTimeoutRef.current = window.setTimeout(() => {
                setControlsVisible(false);
            }, 2000);
        };

        containerElement.addEventListener("pointerup", resetHideTimeout);
        containerElement.addEventListener("pointermove", resetHideTimeout);
        containerElement.addEventListener("pointerleave", resetHideTimeout);

        resetHideTimeout();

        return () => {
            containerElement.removeEventListener("pointerup", resetHideTimeout);
            containerElement.removeEventListener("pointermove", resetHideTimeout);
            containerElement.removeEventListener("pointerleave", resetHideTimeout);

            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [containerElement, settingsVisible, setControlsVisible, state]);

    return (
        <div
            ref={controlsRef}
            className={cn(
                "from-static-black/40 absolute bottom-0 left-0 flex w-full flex-col gap-3 bg-gradient-to-t to-transparent px-4 py-3 transition-all duration-300 lg:gap-4",
                !controlsVisible && "invisible opacity-0",
            )}
        >
            <VideoProgressBar />

            <div className="flex justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                    <button type="button" onClick={togglePlay} aria-label="Pause Button" className="cursor-pointer">
                        {state === State.PLAYING ? (
                            <PauseIcon className="size-6 lg:size-8" />
                        ) : (
                            <PlayIcon className="size-6 lg:size-8" />
                        )}
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={toggleMute}
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
                            <span>{formatTime(currentTime)}</span>
                            <span>/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 lg:gap-4">
                    <VideoPlayerSettings />

                    <button
                        type="button"
                        className="cursor-pointer"
                        onClick={toggleFullScreen}
                        aria-label={fullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {fullScreen ? (
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
