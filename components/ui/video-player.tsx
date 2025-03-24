"use client";

import { memo } from "react";

import VideoPlayerPoster from "../core/video-player/poster";
// import VideoPlayerLoading from "../core/video-player/loading";
import VideoPlayerControls from "../core/video-player/controls";

const VideoPlayer = memo(() => {
    return (
        <>
            <VideoPlayerPoster />
            {/* <VideoPlayerLoading /> */}
            <VideoPlayerControls />
        </>
    );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
