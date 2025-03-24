import { HTMLAttributes, memo, useEffect, useMemo, useRef, useState } from "react";
import {
    ClockIcon,
    CheckIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    AdjustmentsHorizontalIcon,
    ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

import { PlaybackRate, useVideoPlayer } from "./store";

import { cn } from "@/utils/cn";
import useClickOutside from "@/hooks/use-click-outside";

type ViewType = { id: string; title: string };

type Props = HTMLAttributes<HTMLDivElement>;

export const VideoPlayerSettings = memo(({ className, ...rest }: Props) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const wapperRef = useRef<HTMLDivElement | null>(null);

    const settingsVisible = useVideoPlayer((state) => state.settingsVisible);
    const containerElement = useVideoPlayer((state) => state.containerElement);
    const setSettingsVisible = useVideoPlayer((state) => state.setSettingsVisible);

    const [views, setViews] = useState<ViewType[]>([{ id: "root", title: "Cài đặt" }]);

    useClickOutside(wapperRef, () => setSettingsVisible(false));

    const view = useMemo(() => views.at(-1), [views]);
    const handleViewChange = (view: ViewType) => setViews((prev) => [...prev, view]);

    useEffect(() => {
        if (containerElement) {
            const resizeObserver = new ResizeObserver(() => {
                const containerRect = containerElement.getBoundingClientRect();
                console.log("containerWidth", containerRect.width);
                console.log("containerHeight", containerRect.height);
            });

            resizeObserver.observe(containerElement);

            return () => resizeObserver.disconnect();
        }
    }, [containerElement]);

    if (!view) return null;

    return (
        <div ref={wapperRef} className="flex">
            <button type="button" onClick={() => setSettingsVisible(!settingsVisible)} className="cursor-pointer">
                <Cog6ToothIcon className="size-6 lg:size-8" />
            </button>

            <div
                ref={rootRef}
                className={cn(
                    "bg-bg-white-0/80 shadow-regular-xs ring-stroke-soft-200 absolute right-4 bottom-full flex flex-col gap-2 rounded-xl p-4 ring-1 ring-inset",
                    className,
                    !settingsVisible && "hidden",
                )}
                {...rest}
            >
                {views.length > 1 && (
                    <button
                        type="button"
                        onClick={() => setViews(views.slice(0, -1))}
                        className="flex cursor-pointer items-center"
                    >
                        <ChevronLeftIcon className="size-4 lg:size-6" />
                        <span className="ml-1">{views.at(-1)?.title}</span>
                    </button>
                )}

                <QualitySelector view={view} viewCount={views.length} onViewChange={handleViewChange} />
                <SubtitleSelector view={view} viewCount={views.length} onViewChange={handleViewChange} />
                <PlaybackSelector view={view} viewCount={views.length} onViewChange={handleViewChange} />
            </div>
        </div>
    );
});
VideoPlayerSettings.displayName = "VideoPlayerSettings";

type SubSettingProps = {
    view: ViewType;
    viewCount: number;
    onViewChange: (view: ViewType) => void;
};

const QualitySelector = memo(({ view, viewCount, onViewChange }: SubSettingProps) => {
    const manifest = useVideoPlayer((state) => state.manifest);
    const currentLevel = useVideoPlayer((state) => state.currentLevel);
    const setCurrentLevel = useVideoPlayer((state) => state.setCurrentLevel);

    const level = useMemo(
        () => (manifest && currentLevel ? manifest.levels[currentLevel.id] : null),
        [manifest, currentLevel],
    );

    if (!manifest || !currentLevel || (view.id !== "quality" && viewCount > 1)) return null;

    if (view.id !== "quality")
        return (
            <div
                className="flex cursor-pointer justify-between gap-4"
                onClick={() => onViewChange({ id: "quality", title: "Chất lượng" })}
            >
                <div className="flex items-center">
                    <AdjustmentsHorizontalIcon className="size-5 stroke-2 lg:size-6" />
                    <span className="ml-2">Chất lượng</span>
                </div>
                <div className="text-subheading-sm text-text-sub-600 flex items-center font-light">
                    {currentLevel.auto && <span>Tự động</span>}
                    {level && <span>&nbsp;{level.label}</span>}
                </div>
            </div>
        );

    return (
        <ul className="flex min-w-40 flex-col gap-2">
            <li onClick={() => setCurrentLevel(-1)} className="flex cursor-pointer items-center justify-between">
                <span>Tự động</span>
                {currentLevel.auto && <CheckIcon className="size-4 lg:size-5" />}
            </li>

            {manifest.levels.map((level, index) => {
                const isActive = currentLevel.auto ? false : currentLevel.id === index;

                return (
                    <li
                        key={level.label}
                        onClick={() => setCurrentLevel(index)}
                        className={"flex cursor-pointer items-center justify-between gap-2"}
                    >
                        <span>{level.label}</span>
                        {isActive && <CheckIcon className="size-4 lg:size-5" />}
                    </li>
                );
            })}
        </ul>
    );
});

QualitySelector.displayName = "QualitySelector";

const playbackRates: PlaybackRate[] = [
    { value: 0.25, label: "0.25x" },
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "Chuẩn" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
];

const PlaybackSelector = memo(({ view, viewCount, onViewChange }: SubSettingProps) => {
    const playbackRate = useVideoPlayer((state) => state.playbackRate);
    const setPlaybackRate = useVideoPlayer((state) => state.setPlaybackRate);

    if (view.id !== "playbackRate" && viewCount > 1) return null;

    if (view.id !== "playbackRate")
        return (
            <div
                className="flex cursor-pointer justify-between gap-4"
                onClick={() => onViewChange({ id: "playbackRate", title: "Tốc độ phát" })}
            >
                <div className="flex items-center">
                    <ClockIcon className="size-5 stroke-2 lg:size-6" />
                    <span className="ml-2">Tốc độ phát</span>
                </div>
                <div className="text-subheading-sm text-text-sub-600 flex items-center font-light">
                    {playbackRate.label || playbackRate.value}
                </div>
            </div>
        );

    return (
        <ul className="flex min-w-40 flex-col gap-2">
            {playbackRates.map((rate) => {
                const isActive = playbackRate.value === rate.value;

                return (
                    <li
                        key={rate.value}
                        className={"flex cursor-pointer items-center justify-between gap-2"}
                        onClick={() => setPlaybackRate(rate)}
                    >
                        <span>{rate.label || rate.value}</span>
                        {isActive && <CheckIcon className="size-4 lg:size-5" />}
                    </li>
                );
            })}
        </ul>
    );
});

PlaybackSelector.displayName = "PlaybackSelector";

const SubtitleSelector = memo(({ view, viewCount, onViewChange }: SubSettingProps) => {
    const manifest = useVideoPlayer((state) => state.manifest);
    const subtitleTrack = useVideoPlayer((state) => state.subtitleTrack);
    const setSubtitleTrack = useVideoPlayer((state) => state.setSubtitleTrack);

    const subtitle = useMemo(
        () => (manifest && subtitleTrack ? manifest.subtitleTracks[subtitleTrack.id] : null),
        [manifest, subtitleTrack],
    );

    if (!manifest || manifest.subtitleTracks.length === 0 || (view.id !== "subtitle" && viewCount > 1)) return null;

    if (view.id !== "subtitle")
        return (
            <div
                className="flex cursor-pointer justify-between gap-4"
                onClick={() => onViewChange({ id: "subtitle", title: "Phụ đề" })}
            >
                <div className="flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="size-5 stroke-2 lg:size-6" />
                    <span className="ml-2">Phụ đề</span>
                </div>

                <div className="text-subheading-sm text-text-sub-600 flex items-center font-light">
                    <span>{subtitle ? subtitle.name : "Tắt"}</span>
                </div>

                {/* {subtitleTrack ? (
                    <div className="text-subheading-sm text-text-sub-600 flex items-center font-light">
                        {subtitleTrack.auto && <span>Tự động</span>}
                        {subtitle && <span>&nbsp;{subtitle.name}</span>}
                    </div>
                ) : (
                    <div className="text-subheading-sm text-text-sub-600 flex items-center font-light">
                        <span>Tắt</span>
                    </div>
                )} */}
            </div>
        );

    return (
        <ul className="flex min-w-40 flex-col gap-2">
            {/* <li className="flex cursor-pointer items-center justify-between">
                <span>Tự động</span>
                {subtitle && <span>&nbsp;{subtitle.name}</span>}

                {currentSubtitle?.auto && <CheckIcon className="size-4 lg:size-5" />}
            </li> */}

            <li className="flex cursor-pointer items-center justify-between" onClick={() => setSubtitleTrack(-1)}>
                <span>Tắt</span>
                {!subtitleTrack && <CheckIcon className="size-4 lg:size-5" />}
            </li>

            {manifest.subtitleTracks.map((subtitle, index) => {
                const isActive = index === subtitleTrack?.id;

                return (
                    <li
                        key={subtitle.name + index}
                        onClick={() => setSubtitleTrack(index)}
                        className="flex cursor-pointer items-center justify-between gap-2"
                    >
                        <span>{subtitle.name}</span>
                        {isActive && <CheckIcon className="size-4 lg:size-5" />}
                    </li>
                );
            })}
        </ul>
    );
});

SubtitleSelector.displayName = "SubtitleSelector";

export default VideoPlayerSettings;
