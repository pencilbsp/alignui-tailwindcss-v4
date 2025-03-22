"use client";

import VideoPlayerControls from "./video-player-controls";
import VideoPlayerLoading from "./video-player-loading";
import { useVideoPlayer } from "./video-player-provider";

export default function VideoPlayer() {
    const {} = useVideoPlayer();

    return (
        <>
            <VideoPlayerLoading />
            <VideoPlayerControls />
        </>
    );

    // return <div ref={containerRef} className="text-static-white relative h-full w-full">
    //     <video playsInline ref={videoRef} className="h-full w-full" onContextMenu={(e) => e.preventDefault()} />
    //     <div
    //         className={cn("absolute top-0 left-0 flex h-full w-full flex-1 items-center justify-center", {
    //             "invisible opacity-0": isPlaying,
    //         })}
    //     >
    //         {state.isLoading ? (
    //             <Spinner loading className="bg-static-white" size="lg" />
    //         ) : (
    //             <button className="cursor-pointer" type="button" onClick={handlePlay} aria-label="Play Button">
    //                 <PlayIcon className="size-10 lg:size-12" />
    //             </button>
    //         )}
    //     </div>
    //     <div className="absolute bottom-0 left-0 flex w-full flex-col items-center select-none">
    //         <VideoPlayerControls />
    //     </div>
    // </div>
}
