"use client";

import Hls from "hls.js";
import { createContext, HTMLAttributes, useCallback, useContext, useEffect, useReducer, useRef } from "react";

import { cn } from "@/utils/cn";

export enum State {
    ERROR = "ERROR",
    PAUSED = "PAUSED",
    PLAYING = "PLAYING",
    LOADING = "LOADING",
    BUFFERING = "BUFFERING",
}

type VideoPlayerState = {
    state: State;
    mute: boolean;
    isPlaying: boolean;
    showSettings: boolean;
    showControls: boolean;
    hlsInstance: Hls | null;
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;
};

// Context có thể được mở rộng thêm các hàm xử lý
type VideoPlayerContextProps = VideoPlayerState & {
    togglePlay: VoidFunction;
};

const VideoPlayerContext = createContext<VideoPlayerContextProps | null>(null);

export enum PlayerAction {
    TOGGLE_PLAY = "TOGGLE_PLAY",

    SET_HLS_INSTANCE = "SET_HLS_INSTANCE",
}

type VideoPlayerAction =
    | { type: PlayerAction.TOGGLE_PLAY; payload: boolean }
    | { type: PlayerAction.SET_HLS_INSTANCE; payload: Hls };

const reducer = (state: VideoPlayerState, action: VideoPlayerAction) => {
    switch (action.type) {
        case PlayerAction.TOGGLE_PLAY:
            return { ...state, isPlaying: action.payload };

        case PlayerAction.SET_HLS_INSTANCE:
            return { ...state, hlsInstance: action.payload };

        default:
            return state;
    }
};

const useVideoPlayer = () => {
    const context = useContext(VideoPlayerContext);

    if (!context) {
        throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
    }

    return context;
};

const initialState: VideoPlayerState = {
    mute: false,
    isPlaying: false,
    hlsInstance: null,
    videoElement: null,
    showSettings: false,
    showControls: false,
    state: State.LOADING,
    containerElement: null,
};

type Props = HTMLAttributes<HTMLDivElement> & {
    src: string;
    onHlsInstance?: (hlsInstance: Hls) => void;
};

const VideoPlayerProvider = ({ children, className, src, onHlsInstance, ...rest }: Props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [state, dispatch] = useReducer(reducer, initialState);
    // const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
    //
    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
        dispatch({ type: PlayerAction.TOGGLE_PLAY, payload: !videoRef.current.paused });
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        let hlsInstance: Hls | null = null;

        if (video) {
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

            events.forEach((eventName) => video.addEventListener(eventName, handleEvent));

            if (Hls.isSupported()) {
                hlsInstance = new Hls();
                dispatch({ type: PlayerAction.SET_HLS_INSTANCE, payload: hlsInstance });

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
                events.forEach((eventName) => video.removeEventListener(eventName, handleEvent));

                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            };
        }
    }, [src, onHlsInstance]);

    return (
        <VideoPlayerContext.Provider
            value={{
                ...state,
                videoElement: videoRef.current,
                containerElement: containerRef.current,

                togglePlay,
            }}
        >
            <div ref={containerRef} className={cn("relative", className)} {...rest}>
                <video ref={videoRef} playsInline className="h-full w-full" />
                {children}
            </div>
        </VideoPlayerContext.Provider>
    );
};

export { useVideoPlayer };
export default VideoPlayerProvider;
