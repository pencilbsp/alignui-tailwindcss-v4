"use client";

import { memo } from "react";

import "@/app/styles/video-player.css";

import VideoPlayerPoster from "../core/video-player/poster";
import VideoPlayerControls from "../core/video-player/controls";
import VideoPlayerSubtitle from "../core/video-player/subtitle";

const VideoPlayer = memo(() => {
    return (
        <>
            <VideoPlayerPoster />
            <VideoPlayerSubtitle />
            <VideoPlayerControls />
        </>
    );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
