"use client";

import VideoPlayerLoading from "./video-player-loading";
import VideoPlayerControls from "./video-player-controls";

export default function VideoPlayer() {
    return (
        <>
            <VideoPlayerLoading />
            <VideoPlayerControls />
        </>
    );
}
