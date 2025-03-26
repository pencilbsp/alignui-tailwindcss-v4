"use client";

import Hls from "hls.js";
import { HTMLAttributes, useEffect, useRef } from "react";

import { cn } from "@/utils/cn";
import { useVideoPlayer, State } from "./store";

type Subtitle = {
    src: string;
    lang: string;
    name: string;
    default?: boolean;
};

type Props = HTMLAttributes<HTMLDivElement> & {
    src: string;
    subtitles?: Subtitle[];
};

const VideoPlayerProvider = ({ children, className, src, ...rest }: Props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const setState = useVideoPlayer((state) => state.setState);
    const setManifest = useVideoPlayer((state) => state.setManifest);
    const setFullScreen = useVideoPlayer((state) => state.setFullScreen);
    const handleCanPlay = useVideoPlayer((state) => state.handleCanPlay);
    const setHlsInstance = useVideoPlayer((state) => state.setHlsInstance);
    const setCurrentTime = useVideoPlayer((state) => state.setCurrentTime);
    const setPlaybackRate = useVideoPlayer((state) => state.setPlaybackRate);
    const controlsVisible = useVideoPlayer((state) => state.controlsVisible);
    const setVideoElement = useVideoPlayer((state) => state.setVideoElement);
    const setCurrentLevel = useVideoPlayer((state) => state.setCurrentLevel);
    const setSubtitleTrack = useVideoPlayer((state) => state.setSubtitleTrack);
    const setContainerElement = useVideoPlayer((state) => state.setContainerElement);

    useEffect(() => {
        setContainerElement(containerRef.current);
    }, [setContainerElement]);

    useEffect(() => {
        const video = videoRef.current;
        let hlsInstance: Hls | null = null;

        if (video) {
            setVideoElement(video);

            document.addEventListener("fullscreenchange", setFullScreen);

            const events: (keyof HTMLMediaElementEventMap | string)[] = [
                "play",
                "pause",
                "error",
                "ended",
                "waiting",
                "playing",
                "canplay",
                "timeupdate",
                "ratechange",
                "volumechange",
                "webkitendfullscreen",
                "webkitbeginfullscreen",
            ];

            const handleEvent = (event: Event) => {
                switch (event.type) {
                    case "canplay":
                        handleCanPlay(video.duration);
                        break;
                    case "timeupdate":
                        setCurrentTime(video.currentTime);
                        break;
                    case "play":
                    case "playing":
                        setState(State.PLAYING);
                        break;
                    case "pause":
                        setState(State.PAUSED);
                        break;
                    case "waiting":
                        setState(State.BUFFERING);
                        break;
                    case "ratechange":
                        setPlaybackRate(video.playbackRate);
                        break;
                    case "webkitendfullscreen":
                        setFullScreen(false);
                        break;
                    case "webkitbeginfullscreen":
                        setFullScreen(true);
                        break;
                    default:
                        break;
                }
            };

            events.forEach((eventName) => video.addEventListener(eventName, handleEvent));

            if (!src.includes("m3u8")) {
                video.src = src;
            } else if (Hls.isSupported()) {
                hlsInstance = new Hls();
                setHlsInstance(hlsInstance);

                hlsInstance.on(Hls.Events.MANIFEST_PARSED, setManifest);
                hlsInstance.on(Hls.Events.LEVEL_SWITCHED, setCurrentLevel);
                hlsInstance.on(Hls.Events.SUBTITLE_TRACK_SWITCH, setSubtitleTrack);

                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else {
                console.error("Your browser does not support HLS");
            }

            return () => {
                if (hlsInstance) {
                    hlsInstance.off(Hls.Events.MANIFEST_PARSED, setManifest);
                    hlsInstance.off(Hls.Events.LEVEL_SWITCHED, setCurrentLevel);
                    hlsInstance.off(Hls.Events.SUBTITLE_TRACK_SWITCH, setSubtitleTrack);

                    hlsInstance.destroy();
                    setHlsInstance(null);
                }

                if (video) {
                    document.removeEventListener("fullscreenchange", setFullScreen);
                    events.forEach((eventName) => video.removeEventListener(eventName, handleEvent));
                }
            };
        }
    }, [
        src,
        setState,
        setManifest,
        handleCanPlay,
        setFullScreen,
        setCurrentTime,
        setHlsInstance,
        setCurrentLevel,
        setVideoElement,
        setPlaybackRate,
        setSubtitleTrack,
    ]);

    return (
        <div ref={containerRef} className={cn("text-static-white relative", className)} {...rest}>
            <video
                playsInline
                ref={videoRef}
                className={cn(
                    "h-full w-full",
                    controlsVisible ? "translate-y-cue-68 lg:translate-y-cue-80" : "translate-y-cue-12",
                )}
            />

            {children}
        </div>
    );
};

export default VideoPlayerProvider;
