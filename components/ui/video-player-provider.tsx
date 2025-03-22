"use client";

import Hls, { ErrorData, ManifestParsedData } from "hls.js";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";

import { exitFullscreen, requestFullscreen } from "@/utils/video-player";

enum PlayerStatus {
    ERROR = "error",
    PAUSED = "paused",
    PLAYING = "playing",
    LOADING = "loading",
    BUFFERING = "buffering",
}

enum PlayerAction {
    SET_MUTE = "SET_MUTE",
    SET_VOLUME = "SET_VOLUME",
    SET_CONTROLS = "SET_CONTROLS",
    SET_PLAYING = "SET_PLAYING",
    SET_LOADING = "SET_LOADING",
    SET_FULLSCREEN = "SET_FULLSCREEN",
    SET_CURRENT_TIME = "SET_CURRENT_TIME",
    SET_DURATION = "SET_DURATION",
    SET_CURRENT_LEVEL = "SET_CURRENT_LEVEL",
    SET_MANIFEST = "SET_MANIFEST",
    SET_STATUS = "SET_STATUS",
    SET_ERROR = "SET_ERROR",

    PAUSE_EVENT = "PAUSE_EVENT",
    ERROR_EVENT = "ERROR_EVENT",
    CAN_PLAY_EVENT = "CAN_PLAY_EVENT",
}

type VideoPlayerState = {
    mute: boolean;
    volume: number;
    controls: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    fullscreen: boolean;
    currentTime: number;
    status: PlayerStatus;
    duration: number | null;
    manifest: ManifestParsedData | null;
    error: string | ErrorEvent | ErrorData | null;
    currentLevel: { id: number; auto: boolean } | null;
};

type VideoPlayerAction =
    | { type: PlayerAction.PAUSE_EVENT }
    | { type: PlayerAction.SET_MUTE; payload: boolean }
    | { type: PlayerAction.SET_VOLUME; payload: number }
    | { type: PlayerAction.SET_PLAYING; payload: boolean }
    | { type: PlayerAction.SET_LOADING; payload: boolean }
    | { type: PlayerAction.SET_CONTROLS; payload: boolean }
    | { type: PlayerAction.CAN_PLAY_EVENT; payload: number }
    | { type: PlayerAction.SET_FULLSCREEN; payload: boolean }
    | { type: PlayerAction.SET_CURRENT_TIME; payload: number }
    | { type: PlayerAction.SET_STATUS; payload: PlayerStatus }
    | { type: PlayerAction.SET_DURATION; payload: number | null }
    | { type: PlayerAction.SET_MANIFEST; payload: ManifestParsedData | null }
    | { type: PlayerAction.ERROR_EVENT; payload: string | ErrorEvent | ErrorData | null }
    | { type: PlayerAction.SET_CURRENT_LEVEL; payload: { id: number; auto: boolean } | null };

const initialState: VideoPlayerState = {
    mute: false,
    error: null,
    volume: 100,
    currentTime: 0,
    manifest: null,
    duration: null,
    controls: false,
    isPlaying: false,
    isLoading: true,
    fullscreen: false,
    currentLevel: null,
    status: PlayerStatus.LOADING,
};

function reducer(state: VideoPlayerState, action: VideoPlayerAction): VideoPlayerState {
    switch (action.type) {
        case PlayerAction.SET_MUTE:
            return { ...state, mute: action.payload };
        case PlayerAction.SET_STATUS:
            return { ...state, status: action.payload };
        case PlayerAction.SET_VOLUME:
            return { ...state, volume: action.payload };
        case PlayerAction.SET_DURATION:
            return { ...state, duration: action.payload };
        case PlayerAction.SET_MANIFEST:
            return { ...state, manifest: action.payload };
        case PlayerAction.SET_CONTROLS:
            return { ...state, controls: action.payload };
        case PlayerAction.SET_PLAYING:
            return { ...state, isPlaying: action.payload };
        case PlayerAction.SET_LOADING:
            return { ...state, isLoading: action.payload };
        case PlayerAction.SET_FULLSCREEN:
            return { ...state, fullscreen: action.payload };
        case PlayerAction.SET_CURRENT_TIME:
            return { ...state, currentTime: action.payload };
        case PlayerAction.SET_CURRENT_LEVEL:
            return { ...state, currentLevel: action.payload };
        case PlayerAction.PAUSE_EVENT:
            return { ...state, controls: true, status: PlayerStatus.PAUSED };
        case PlayerAction.ERROR_EVENT:
            return { ...state, status: PlayerStatus.ERROR, error: action.payload };
        case PlayerAction.CAN_PLAY_EVENT:
            return { ...state, status: PlayerStatus.PAUSED, duration: action.payload };
        default:
            return state;
    }
}

// Context có thể được mở rộng thêm các hàm xử lý
type VideoPlayerContextProps = VideoPlayerState & {
    hls: Hls | null;
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;
    handlePlay: VoidFunction;
    handleMute: VoidFunction;
    handleFullScreen: VoidFunction;
    handleSeek: (time: number) => void;
    handleChangeVolume: (volume: number) => void;
    handleChangeQuality: (level: number) => void;
};

const VideoPlayerContext = createContext<VideoPlayerContextProps | null>(null);

function useVideoPlayer() {
    const context = useContext(VideoPlayerContext);
    if (!context) {
        throw new Error("useVideoPlayer must be used within a <VideoPlayer />");
    }
    return context;
}

type Props = {
    src: string;
    children: React.ReactNode;
};

function VideoPlayerProvider({ src, children }: Props) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const hlsInstance = useRef<Hls | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<number | null>(null);

    // Ví dụ xử lý play/pause
    const handlePlay = useCallback(() => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }, []);

    const handleMute = useCallback(() => {
        if (!videoRef.current) return;

        const mute = !videoRef.current.muted;
        dispatch({ type: PlayerAction.SET_MUTE, payload: mute });
        videoRef.current.muted = mute;
    }, []);

    const handleFullScreen = useCallback(() => {
        if (!containerRef.current) return;

        const fullscreen = state.fullscreen ? exitFullscreen() : requestFullscreen(containerRef.current);
        dispatch({ type: PlayerAction.SET_FULLSCREEN, payload: fullscreen });
    }, [state.fullscreen]);

    const handleSeek = useCallback(
        (time: number) => {
            if (!videoRef.current || state.duration === null || time < 0 || time > state.duration) return;

            dispatch({ type: PlayerAction.SET_CURRENT_TIME, payload: time });
            videoRef.current.currentTime = time;
        },
        [state.duration],
    );

    const handleChangeVolume = useCallback((volume: number) => {
        if (!videoRef.current || volume < 0 || volume > 100) return;

        dispatch({ type: PlayerAction.SET_VOLUME, payload: volume });
        videoRef.current.volume = volume;
    }, []);

    const handleChangeQuality = useCallback(
        (level: number) => {
            if (!hlsInstance.current || !state.manifest) return;
            if (level !== -1 && !state.manifest.levels[level]) return;

            hlsInstance.current.currentLevel = level;
            // Cập nhật currentLevel nếu cần
            dispatch({
                type: PlayerAction.SET_CURRENT_LEVEL,
                payload: { id: level, auto: level === -1 },
            });
        },
        [state.manifest],
    );

    // Ví dụ lắng nghe fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () =>
            dispatch({ type: PlayerAction.SET_FULLSCREEN, payload: !!document.fullscreenElement });

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Xử lý ẩn hiện controls sau khoảng thời gian không tương tác
    useEffect(() => {
        const container = containerRef.current;
        if (!container || ["loading", "paused"].includes(state.status)) return;

        const resetHideTimeout = () => {
            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }
            dispatch({ type: PlayerAction.SET_CONTROLS, payload: true });
            hideTimeoutRef.current = window.setTimeout(() => {
                dispatch({ type: PlayerAction.SET_CONTROLS, payload: false });
            }, 2000);
        };

        container.addEventListener("mousemove", resetHideTimeout);
        container.addEventListener("touchstart", resetHideTimeout);
        container.addEventListener("pointermove", resetHideTimeout);

        resetHideTimeout();

        return () => {
            container.removeEventListener("mousemove", resetHideTimeout);
            container.removeEventListener("touchstart", resetHideTimeout);
            container.removeEventListener("pointermove", resetHideTimeout);
            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [state.status]);

    // Lắng nghe các event từ video element và cập nhật state thông qua reducer
    useEffect(() => {
        const video = videoRef.current;
        const events: (keyof HTMLMediaElementEventMap)[] = [
            "play",
            "pause",
            "error",
            "ended",
            "seeked",
            "waiting",
            "playing",
            "canplay",
            "timeupdate",
            "volumechange",
        ];
        const handleEvent = (event: Event) => {
            if (!video) return;

            switch (event.type) {
                case "pause":
                    dispatch({ type: PlayerAction.PAUSE_EVENT });
                    break;
                case "volumechange":
                    dispatch({ type: PlayerAction.SET_MUTE, payload: video.muted });
                    break;
                case "play":
                case "canplay":
                    dispatch({ type: PlayerAction.CAN_PLAY_EVENT, payload: video.duration });
                    break;
                case "playing":
                    dispatch({ type: PlayerAction.SET_STATUS, payload: PlayerStatus.PLAYING });
                    break;
                case "error":
                    dispatch({ type: PlayerAction.ERROR_EVENT, payload: event as ErrorEvent });
                    break;
                case "waiting":
                    dispatch({ type: PlayerAction.SET_STATUS, payload: PlayerStatus.BUFFERING });
                    break;
                case "timeupdate":
                    dispatch({ type: PlayerAction.SET_CURRENT_TIME, payload: video.currentTime });
                    break;
                default:
                    break;
            }
        };

        if (video) {
            events.forEach((eventName) => video.addEventListener(eventName, handleEvent));

            if (Hls.isSupported()) {
                hlsInstance.current = new Hls();

                hlsInstance.current.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
                    if (!hlsInstance.current) return;

                    dispatch({
                        type: PlayerAction.SET_CURRENT_LEVEL,
                        payload: { id: data.level, auto: hlsInstance.current.autoLevelEnabled },
                    });
                });

                hlsInstance.current.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                    dispatch({ type: PlayerAction.SET_MANIFEST, payload: data });
                });

                hlsInstance.current.on(Hls.Events.ERROR, (_, data) => {
                    dispatch({ type: PlayerAction.ERROR_EVENT, payload: data });
                });

                hlsInstance.current.loadSource(src);
                hlsInstance.current.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            }
        }
        return () => {
            if (video) {
                events.forEach((eventName) => {
                    video.removeEventListener(eventName, handleEvent);
                });
            }
            if (hlsInstance.current) {
                hlsInstance.current.destroy();
            }
        };
    }, [src]);

    const context = useMemo(
        () => ({
            ...state,
            handlePlay,
            handleMute,
            handleSeek,
            handleFullScreen,
            handleChangeVolume,
            handleChangeQuality,
            hls: hlsInstance.current,
            videoElement: videoRef.current,
            containerElement: containerRef.current,
            isPlaying: state.status === PlayerStatus.PLAYING,
            isLoading: state.status === PlayerStatus.LOADING || state.status === PlayerStatus.BUFFERING,
        }),
        [state, handlePlay, handleMute, handleFullScreen, handleSeek, handleChangeVolume, handleChangeQuality],
    );

    return (
        <VideoPlayerContext.Provider value={context}>
            <div ref={containerRef} className="text-static-white relative h-full w-full">
                <video playsInline ref={videoRef} className="h-full w-full" onContextMenu={(e) => e.preventDefault()} />
                {children}
            </div>
        </VideoPlayerContext.Provider>
    );
}

export { useVideoPlayer };
export default VideoPlayerProvider;
