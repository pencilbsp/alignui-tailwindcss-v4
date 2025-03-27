"use client";

import { memo, useEffect, useMemo, useRef } from "react";
// import {
//     PlayIcon,
//     PauseIcon,
//     SpeakerXMarkIcon,
//     SpeakerWaveIcon,
//     ArrowsPointingInIcon,
//     ArrowsPointingOutIcon,
// } from "@heroicons/react/24/outline";

import {
    RiPauseLine,
    RiVolumeUpLine,
    RiPlayLargeLine,
    RiVolumeMuteLine,
    RiFullscreenLine,
    RiFullscreenExitLine,
    RiClosedCaptioningLine,
} from "@remixicon/react";

import { cn } from "@/utils/cn";

import VideoPlayerTime from "./time";
import VideoPlayerSettings from "./settings";
import ControlButton from "./control-button";
import VideoProgressBar from "./progress-bar";
import { useVideoPlayer, State } from "./store";

const VideoPlayerControls = memo(() => {
    const controlsRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mute = useVideoPlayer((state) => state.mute);
    const state = useVideoPlayer((state) => state.state);
    const toggleMute = useVideoPlayer((state) => state.toggleMute);
    const togglePlay = useVideoPlayer((state) => state.togglePlay);
    const fullScreen = useVideoPlayer((state) => state.fullScreen);
    const videoElement = useVideoPlayer((state) => state.videoElement);
    const settingsVisible = useVideoPlayer((state) => state.settingsVisible);
    const controlsVisible = useVideoPlayer((state) => state.controlsVisible);
    const containerElement = useVideoPlayer((state) => state.containerElement);
    const toggleFullScreen = useVideoPlayer((state) => state.toggleFullScreen);
    const setControlsVisible = useVideoPlayer((state) => state.setControlsVisible);

    const isPlaying = useMemo(() => state === State.PLAYING, [state]);

    useEffect(() => {
        if (containerElement && videoElement) {
            const resizeObserver = new ResizeObserver(() => {
                const containerRect = containerElement.getBoundingClientRect();

                let controlsHeight = 0;
                if (controlsRef.current) {
                    const controlsRect = controlsRef.current.getBoundingClientRect();
                    controlsHeight = controlsRect.height;
                    containerElement.style.setProperty("--video-player-controls-height", controlsHeight + "px");
                }

                if (videoElement) {
                    const videoRect = videoElement.getBoundingClientRect();
                    const safeAreaBottom = containerRect.height - videoRect.bottom;
                    containerElement.style.setProperty("--video-player-safe-area-bottom", safeAreaBottom + "px");

                    const isAdaptive = safeAreaBottom <= controlsHeight;
                    containerElement.classList[isAdaptive ? "add" : "remove"]("adaptive-cue-display");
                }

                const cueFontSize = Math.min(Math.max(containerRect.width * 0.025, 14), 36);
                containerElement.style.setProperty("--video-player-cue-font-size", cueFontSize + "px");
                containerElement.style.setProperty("--video-player-height", containerRect.height + "px");
            });

            resizeObserver.observe(containerElement);

            return () => resizeObserver.disconnect();
        }
    }, [containerElement, videoElement]);

    // Xử lý ẩn hiện controls sau khoảng thời gian không tương tác
    useEffect(() => {
        if (!containerElement || [State.LOADING, State.PAUSED].includes(state)) return;

        const resetHideTimeout = () => {
            if (hideTimeoutRef.current !== null) {
                clearTimeout(hideTimeoutRef.current);
            }

            setControlsVisible(true);

            if (settingsVisible) return;

            hideTimeoutRef.current = setTimeout(() => {
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
                "from-static-black/40 absolute bottom-0 left-0 flex w-full flex-col gap-2 bg-gradient-to-t to-transparent px-4 py-3 transition-all lg:gap-3",
                !controlsVisible && "invisible opacity-0",
            )}
        >
            <VideoProgressBar />

            <div className="flex justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                    <ControlButton
                        onClick={togglePlay}
                        icon={isPlaying ? RiPauseLine : RiPlayLargeLine}
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                    />

                    <ControlButton
                        onClick={toggleMute}
                        aria-label={mute ? "Unmute" : "Mute"}
                        icon={mute ? RiVolumeMuteLine : RiVolumeUpLine}
                    />

                    <VideoPlayerTime />
                </div>

                <div className="flex items-center gap-3 lg:gap-4">
                    <ControlButton
                        icon={RiClosedCaptioningLine}
                        aria-label={fullScreen ? "Enable subtitle" : "Disable subtitle"}
                    />

                    <VideoPlayerSettings />

                    <ControlButton
                        onClick={toggleFullScreen}
                        icon={fullScreen ? RiFullscreenExitLine : RiFullscreenLine}
                        aria-label={fullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                    />
                </div>
            </div>
        </div>
    );
});

VideoPlayerControls.displayName = "VideoPlayerControls";

export default VideoPlayerControls;
