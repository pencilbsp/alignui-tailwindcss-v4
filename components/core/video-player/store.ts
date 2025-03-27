import { create } from "zustand";
import Hls, {
    Events,
    Level,
    MediaPlaylist,
    LevelSwitchedData,
    ManifestParsedData,
    SubtitleTrackSwitchData,
} from "hls.js";

const requestFullscreen = (element: HTMLElement) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
        return true;
    } else if (element.mozRequestFullScreen) {
        // Firefox
        element.mozRequestFullScreen();
        return true;
    } else if (element.webkitRequestFullscreen) {
        // Chrome, Safari, Opera
        element.webkitRequestFullscreen();
        return true;
    } else if (element.msRequestFullscreen) {
        // IE/Edge
        element.msRequestFullscreen();
        return true;
    } else {
        if (element.tagName !== "VIDEO") {
            const video = element.querySelector("video");

            if (video && video.webkitEnterFullScreen) {
                video.webkitEnterFullScreen();
                return true;
            }
        }

        console.warn("Fullscreen API is not supported on this browser.");
        return false;
    }
};

const exitFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        return false;
    } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
        return false;
    } else if (document.webkitExitFullscreen) {
        // Chrome, Safari, Opera (nếu hỗ trợ chuẩn)
        document.webkitExitFullscreen();
        return false;
    } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
        return false;
    } else if (document.activeElement && document.activeElement.tagName === "VIDEO") {
        const video = document.activeElement as HTMLVideoElement;
        // iOS Safari: nếu video đang ở fullscreen sử dụng webkitEnterFullScreen
        if (video.webkitExitFullscreen) {
            video.webkitExitFullscreen();
            return false;
        }
    }

    console.warn("Fullscreen exit API is not supported on this browser.");
    return true;
};

const formatBitrate = (bitrate: number) => {
    if (bitrate >= 1000000) {
        // Chuyển sang mbps
        return (bitrate / 1000000).toFixed(2) + "Mbps";
    } else if (bitrate >= 1000) {
        // Chuyển sang kbps
        return (bitrate / 1000).toFixed(0) + "kbps";
    } else {
        // Để ở dạng bps
        return bitrate + "bps";
    }
};

const getLevelResolution = (lavels: Level[]) => {
    const seen = new Map<number, number[]>();
    return lavels
        .map((level, index) => {
            const { width, height } = level;
            const pixels = width > height ? height : width;

            const indexes = seen.get(pixels);
            if (indexes) {
                seen.set(pixels, [...indexes, index]);
            } else {
                seen.set(pixels, [index]);
            }

            return { ...level, label: pixels };
        })
        .map((level, index) => {
            const indexes = seen.get(level.label);

            if (indexes && indexes.length > 1 && indexes.includes(index)) {
                return { ...level, label: `${level.label}p (${formatBitrate(level.bitrate)})` } as Level;
            }

            return { ...level, label: `${level.label}p` } as Level;
        });
};

const getUniqueTrack = (tracks: MediaPlaylist[]) => {
    const seen = new Set<string | number>();

    return tracks.filter((track) => {
        if (seen.has(track.lang || track.id)) return false;
        seen.add(track.lang || track.id);
        return true;
    });
};

export enum State {
    ERROR = "error",
    PAUSED = "paused",
    PLAYING = "playing",
    LOADING = "loading",
    BUFFERING = "buffering",
}

export enum SettingsName {
    ROOT = "ROOT",
    LEVEL = "LEVEL",
    SUBTITLE = "SUBTITLE",
    PLAYBACK_RATE = "PLAYBACK_RATE",
}

export type SubtitleTrack = { id: number };
export type SettingView = { id: string; title: string };
export type CurrentLevel = { id: number; auto: boolean };
export type PlaybackRate = { value: number; label?: string };

export const settings: Record<SettingsName, SettingView> = {
    [SettingsName.ROOT]: { id: SettingsName.ROOT, title: "Cài đặt" },
    [SettingsName.LEVEL]: { id: SettingsName.LEVEL, title: "Chất lượng" },
    [SettingsName.SUBTITLE]: { id: SettingsName.SUBTITLE, title: "Phụ đề" },
    [SettingsName.PLAYBACK_RATE]: { id: SettingsName.PLAYBACK_RATE, title: "Tốc độ phát" },
};

type VideoPlayerStore = {
    state: State;
    mute: boolean;
    currentTime: number;
    fullScreen: boolean;
    duration: number | null;
    hlsInstance: Hls | null;
    controlsVisible: boolean;
    playbackRate: PlaybackRate;
    defaultRates: PlaybackRate[];
    currentLevel: CurrentLevel | null;
    subtitleTrack: SubtitleTrack | null;
    manifest: ManifestParsedData | null;
    settingsVisible: SettingView[] | null;
    videoElement: HTMLVideoElement | null;
    containerElement: HTMLDivElement | null;

    togglePlay: VoidFunction;
    toggleMute: VoidFunction;
    closeSettings: () => void;
    toggleSettings: () => void;
    seek: (time: number) => void;
    toPreviousSettings: () => void;
    toggleFullScreen: VoidFunction;
    handleCanPlay: (duration: number) => void;
    toNextSettings: (view: SettingView) => void;
    setFullScreen: (e: Event | boolean) => void;

    setState: (state: State) => void;
    setCurrentTime: (currentTime: number) => void;
    setHlsInstance: (instance: Hls | null) => void;
    setPlaybackRate: (rate: number | PlaybackRate) => void;
    setControlsVisible: (controlsVisible: boolean) => void;
    setVideoElement: (element: HTMLVideoElement | null) => void;
    setContainerElement: (element: HTMLDivElement | null) => void;
    setManifest: (e: Events.MANIFEST_PARSED, manifest: ManifestParsedData) => void;
    setCurrentLevel: (event: number | Events.LEVEL_SWITCHED, level?: LevelSwitchedData) => void;
    setSubtitleTrack: (event: number | Events.SUBTITLE_TRACK_SWITCH, level?: SubtitleTrackSwitchData) => void;
};

export const useVideoPlayer = create<VideoPlayerStore>((set) => ({
    mute: false,
    duration: null,
    currentTime: 0,
    manifest: null,
    isPlaying: false,
    fullScreen: false,
    hlsInstance: null,
    currentLevel: null,
    videoElement: null,
    subtitleTrack: null,
    state: State.LOADING,
    settingsVisible: null,
    containerElement: null,
    controlsVisible: false,
    defaultRates: [
        { value: 0.25, label: "0.25x" },
        { value: 0.5, label: "0.5x" },
        { value: 1, label: "Chuẩn" },
        { value: 1.5, label: "1.5x" },
        { value: 2, label: "2x" },
    ],
    playbackRate: { value: 1, label: "Chuẩn" },

    seek: (time) => {
        set((state) => {
            if (state.videoElement && state.duration !== null && time >= 0 && time <= state.duration) {
                state.videoElement.currentTime = time;
            }

            return state;
        });
    },
    setState: (state) => set({ state }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setPlaybackRate: (rate) =>
        set((state) => {
            if (!state.videoElement) return state;

            if (typeof rate === "number") {
                rate = { value: rate, label: rate + "x" };
            }

            const existingRate = state.defaultRates.find((r) => r.value === (rate as PlaybackRate).value);

            state.videoElement.playbackRate = rate.value;

            if (!existingRate) {
                return { defaultRates: [...state.defaultRates, rate], playbackRate: rate };
            }

            return { playbackRate: rate };
        }),
    setSubtitleTrack: (event, track) =>
        set((state) => {
            if (state.hlsInstance && state.manifest && state.manifest.subtitleTracks.length > 0) {
                if (typeof event === "number" && event >= -1 && event < state.manifest.subtitleTracks.length) {
                    state.hlsInstance.subtitleTrack = event;
                    return { subtitleTrack: event === -1 ? null : { id: event } };
                }

                if (track) {
                    return { subtitleTrack: { id: track.id } };
                }
            }

            return state;
        }),
    setHlsInstance: (instance) => set({ hlsInstance: instance }),
    setVideoElement: (element) => set({ videoElement: element }),
    handleCanPlay: (duration) => set({ duration, state: State.PAUSED }),
    setContainerElement: (element) => set({ containerElement: element }),
    setFullScreen: (event) => {
        if (typeof event === "boolean") {
            set({ fullScreen: event });
        } else {
            set({ fullScreen: !!document.fullscreenElement });
        }
    },
    setManifest: (_, manifest) =>
        set({
            manifest: {
                ...manifest,
                levels: getLevelResolution(manifest.levels),
                subtitleTracks: getUniqueTrack(manifest.subtitleTracks),
            },
        }),
    setCurrentLevel: (event, level) =>
        set((state) => {
            if (state.hlsInstance && state.manifest) {
                const id = state.hlsInstance.currentLevel;

                if (typeof event === "number" && event >= -1 && event < state.manifest.levels.length) {
                    state.hlsInstance.currentLevel = event;
                    return { currentLevel: { id: event === -1 ? id : event, auto: event === -1 ? true : false } };
                }

                if (level) {
                    return { currentLevel: { id: level.level, auto: state.hlsInstance.autoLevelEnabled } };
                }
            }

            return state;
        }),
    togglePlay: () =>
        set((state) => {
            if (state.videoElement) {
                if (state.videoElement.paused) {
                    state.videoElement.play();
                } else {
                    state.videoElement.pause();
                }
            }

            return state;
        }),
    toggleMute: () =>
        set((state) => {
            if (state.videoElement) {
                state.videoElement.muted = !state.videoElement.muted;
                return { mute: state.videoElement.muted };
            }

            return state;
        }),
    toggleFullScreen: () => {
        set((state) => {
            if (state.containerElement) {
                let fullScreen = state.fullScreen;
                if (state.fullScreen) {
                    fullScreen = exitFullscreen();
                } else {
                    fullScreen = requestFullscreen(state.containerElement);
                }

                return { fullScreen };
            }

            return state;
        });
    },
    setControlsVisible: (controlsVisible) => set({ controlsVisible }),
    closeSettings: () => set({ settingsVisible: null }),
    toggleSettings: () =>
        set((state) => {
            return { settingsVisible: state.settingsVisible ? null : [settings.ROOT] };
        }),
    toPreviousSettings: () =>
        set((state) => {
            if (Array.isArray(state.settingsVisible) && state.settingsVisible.length > 1) {
                return { settingsVisible: state.settingsVisible.slice(0, -1) };
            }

            return state;
        }),
    toNextSettings: (view: SettingView) =>
        set((state) => {
            if (Array.isArray(state.settingsVisible)) {
                return { settingsVisible: [...state.settingsVisible, view] };
            }

            return state;
        }),
}));
