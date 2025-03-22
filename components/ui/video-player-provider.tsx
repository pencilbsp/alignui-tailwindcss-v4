"use client";

import Hls, { ErrorData, ManifestParsedData } from "hls.js";
import React, {
    ActionDispatch,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from "react";

import { exitFullscreen, getLevelResolution, requestFullscreen } from "@/utils/video-player";

export enum PlayerStatus {
    ERROR = "error",
    PAUSED = "paused",
    PLAYING = "playing",
    LOADING = "loading",
    BUFFERING = "buffering",
}

export enum PlayerAction {
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
    SET_PLAYBACK_RATE = "SET_PLAYBACK_RATE",
    SET_STATUS = "SET_STATUS",
    SET_ERROR = "SET_ERROR",

    PAUSE_EVENT = "PAUSE_EVENT",
    ERROR_EVENT = "ERROR_EVENT",
    CAN_PLAY_EVENT = "CAN_PLAY_EVENT",
}

export type PlaybackRate = {
    value: number;
    label?: string;
};

export type VideoPlayerState = {
    mute: boolean;
    volume: number;
    controls: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    fullscreen: boolean;
    currentTime: number;
    status: PlayerStatus;
    duration: number | null;
    playbackRate: PlaybackRate;
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
    | { type: PlayerAction.SET_PLAYBACK_RATE; payload: PlaybackRate }
    | { type: PlayerAction.SET_MANIFEST; payload: ManifestParsedData }
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
    playbackRate: { value: 1, label: "Chuẩn" },
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
            const levels = getLevelResolution(action.payload.levels);
            return { ...state, manifest: { ...action.payload, levels } };
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
        case PlayerAction.SET_PLAYBACK_RATE:
            return { ...state, playbackRate: action.payload };
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
    hlsInstance: Hls | null;
    handlePlay: VoidFunction;
    handleMute: VoidFunction;
    handleFullScreen: VoidFunction;
    handleSeek: (time: number) => void;
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;
    handleChangeVolume: (volume: number) => void;
    handleChangeQuality: (level: number) => void;
    dispatch: ActionDispatch<[action: VideoPlayerAction]>;
    handleChangePlaybackRate: (rate: PlaybackRate) => void;
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

            const currentLevel = level === -1 ? hlsInstance.current.currentLevel : level;
            hlsInstance.current.currentLevel = level;
            // Cập nhật currentLevel nếu cần
            dispatch({
                type: PlayerAction.SET_CURRENT_LEVEL,
                payload: { id: currentLevel, auto: level === -1 },
            });
        },
        [state.manifest],
    );

    const handleChangePlaybackRate = useCallback((rate: PlaybackRate) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = rate.value;
        dispatch({ type: PlayerAction.SET_PLAYBACK_RATE, payload: rate });
    }, []);

    // Ví dụ lắng nghe fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () =>
            dispatch({ type: PlayerAction.SET_FULLSCREEN, payload: !!document.fullscreenElement });

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Lắng nghe các event từ video element và cập nhật state thông qua reducer
    useEffect(() => {
        const video = videoRef.current;
        const events: (keyof HTMLMediaElementEventMap)[] = [
            "play",
            "pause",
            "error",
            "ended",
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
                case "canplay":
                    dispatch({ type: PlayerAction.CAN_PLAY_EVENT, payload: video.duration });
                    break;
                case "play":
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
            dispatch,
            handlePlay,
            handleMute,
            handleSeek,
            handleFullScreen,
            handleChangeVolume,
            handleChangeQuality,
            handleChangePlaybackRate,
            videoElement: videoRef.current,
            hlsInstance: hlsInstance.current,
            containerElement: containerRef.current,
            isPlaying: state.status === PlayerStatus.PLAYING,
            isLoading: state.status === PlayerStatus.LOADING || state.status === PlayerStatus.BUFFERING,
        }),
        [
            state,
            dispatch,
            handlePlay,
            handleMute,
            handleSeek,
            handleFullScreen,
            handleChangeVolume,
            handleChangeQuality,
            handleChangePlaybackRate,
        ],
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
