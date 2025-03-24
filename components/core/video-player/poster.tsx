import { memo, useMemo } from "react";
import { PlayIcon } from "@heroicons/react/24/outline";

import { Spinner } from "../spinner";
import { useVideoPlayer, State } from "./store";

const VideoPlayerPoster = memo(() => {
    // const clickTimeRef = useRef<number | null>(null);

    const state = useVideoPlayer((state) => state.state);
    const togglePlay = useVideoPlayer((state) => state.togglePlay);
    // const videoElement = useVideoPlayer((state) => state.videoElement);

    // const handleNext = useCallback(() => {
    //     if (videoElement) {
    //         const duration = videoElement.duration;
    //         const currentTime = videoElement.currentTime;

    //         if (currentTime + 10 < duration) {
    //             videoElement.currentTime = currentTime + 10;
    //         }
    //     }
    // }, [videoElement]);

    // const handlePrev = useCallback(() => {
    //     if (videoElement) {
    //         const currentTime = videoElement.currentTime;

    //         if (currentTime - 10 > 0) {
    //             videoElement.currentTime = currentTime - 10;
    //         }
    //     }
    // }, [videoElement]);

    // const handleClick = useCallback(
    //     (event: MouseEvent<HTMLDivElement>) => {
    //         if (clickTimeRef.current) {
    //             window.clearTimeout(clickTimeRef.current);
    //             clickTimeRef.current = null;

    //             const isNext = event.currentTarget.dataset["seek"] === "next";
    //             if (isNext) {
    //                 handleNext();
    //             } else {
    //                 handlePrev();
    //             }
    //         } else {
    //             clickTimeRef.current = window.setTimeout(() => {
    //                 clickTimeRef.current = null;

    //                 if (state === State.PLAYING) {
    //                     togglePlay();
    //                 }
    //             }, 250);
    //         }
    //     },
    //     [handleNext, handlePrev, togglePlay, state],
    // );

    const isLoading = useMemo(() => state === State.LOADING || state === State.BUFFERING, [state]);

    return (
        <div
            className="absolute top-0 left-0 z-0 flex h-full w-full"
            onClick={() => {
                console.log("click", state);
                if (state === State.PLAYING) {
                    togglePlay();
                }
            }}
        >
            <div className="flex-1" />
            <div className="flex flex-1 items-center justify-center">
                {isLoading && <Spinner loading className="bg-static-white" size="lg" />}
                {state === State.PAUSED && (
                    <button className="cursor-pointer" type="button" onClick={togglePlay} aria-label="Play Button">
                        <PlayIcon className="size-12 lg:size-14" />
                    </button>
                )}
            </div>
            <div className="flex-1" />
        </div>
    );
});

VideoPlayerPoster.displayName = "VideoPlayerPoster";

export default VideoPlayerPoster;
