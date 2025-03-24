"use client";

import Hls from "hls.js";
import { HTMLAttributes, useEffect, useRef } from "react";

import { cn } from "@/utils/cn";
import { useVideoPlayer, State } from "./store";

type Props = HTMLAttributes<HTMLDivElement> & {
    src: string;
    onHlsInstance?: (hlsInstance: Hls) => void;
};

const VideoPlayerProvider = ({ children, className, src, onHlsInstance, ...rest }: Props) => {
    // console.log("rendering VideoPlayerProvider...");

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const setState = useVideoPlayer((state) => state.setState);
    const setManifest = useVideoPlayer((state) => state.setManifest);
    const setFullScreen = useVideoPlayer((state) => state.setFullScreen);
    const handleCanPlay = useVideoPlayer((state) => state.handleCanPlay);
    const setHlsInstance = useVideoPlayer((state) => state.setHlsInstance);
    const setCurrentTime = useVideoPlayer((state) => state.setCurrentTime);
    const setVideoElement = useVideoPlayer((state) => state.setVideoElement);
    const setCurrentLevel = useVideoPlayer((state) => state.setCurrentLevel);
    const setSubtitleTrack = useVideoPlayer((state) => state.setSubtitleTrack);
    const setContainerElement = useVideoPlayer((state) => state.setContainerElement);

    useEffect(() => {
        setContainerElement(containerRef.current);
    }, [setContainerElement]);

    // useEffect(() => {
    //     document.addEventListener("fullscreenchange", setFullScreen);

    //     return () => document.removeEventListener("fullscreenchange", setFullScreen);
    // }, [setFullScreen]);

    // useEffect(() => {
    //     const videoElement = videoRef.current;

    //     if (videoElement) {
    //         setVideoElement(videoElement);

    //         document.addEventListener("fullscreenchange", setFullScreen);

    //         const events: (keyof HTMLMediaElementEventMap | string)[] = [
    //             "play",
    //             "pause",
    //             "error",
    //             "ended",
    //             "waiting",
    //             "playing",
    //             "canplay",
    //             "timeupdate",
    //             "volumechange",
    //             "webkitendfullscreen",
    //             "webkitbeginfullscreen",
    //         ];

    //         const handleEvent = (event: Event) => {
    //             switch (event.type) {
    //                 case "canplay":
    //                     handleCanPlay(videoElement.duration);
    //                     break;
    //                 case "timeupdate":
    //                     setCurrentTime(videoElement.currentTime);
    //                     break;
    //                 case "play":
    //                 case "playing":
    //                     setState(State.PLAYING);
    //                     break;
    //                 case "pause":
    //                     setState(State.PAUSED);
    //                     break;
    //                 case "waiting":
    //                     setState(State.BUFFERING);
    //                     break;
    //                 case "webkitendfullscreen":
    //                     setFullScreen(false);
    //                     break;
    //                 case "webkitbeginfullscreen":
    //                     setFullScreen(true);
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         };

    //         events.forEach((eventName) => videoElement.addEventListener(eventName, handleEvent));

    //         return () => {
    //             document.removeEventListener("fullscreenchange", setFullScreen);
    //             events.forEach((eventName) => videoElement.removeEventListener(eventName, handleEvent));
    //         };
    //     }
    // }, [setVideoElement, setCurrentTime, handleCanPlay, setState, setFullScreen]);

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

            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                setHlsInstance(hlsInstance);

                hlsInstance.on(Hls.Events.MANIFEST_PARSED, setManifest);
                hlsInstance.on(Hls.Events.LEVEL_SWITCHED, setCurrentLevel);
                hlsInstance.on(Hls.Events.SUBTITLE_TRACK_SWITCH, setSubtitleTrack);
                // hlsInstance.on(Hls.Events.SU, setSubtitleTrack);

                // hlsInstance.subtitleTrack.

                // hlsInstance.on(Hls.Events.BUFFER_APPENDED, (e, d) => {
                //     console.log("BUFFER_APPENDED", timeRangesToString(d.timeRanges.video!));
                // });

                if (typeof onHlsInstance === "function") {
                    onHlsInstance(hlsInstance);
                }

                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else {
                console.error("Your browser does not support HLS");
            }

            return () => {
                if (hlsInstance) {
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
        onHlsInstance,
        setCurrentTime,
        setHlsInstance,
        setCurrentLevel,
        setVideoElement,
        setSubtitleTrack,
    ]);

    return (
        <div ref={containerRef} className={cn("text-static-white relative", className)} {...rest}>
            <video ref={videoRef} playsInline className="h-full w-full" />
            {children}
        </div>
    );
};

export default VideoPlayerProvider;
