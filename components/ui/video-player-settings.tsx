import { memo, useRef, useState } from "react";
import {
    ClockIcon,
    CheckIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    AdjustmentsHorizontalIcon,
    ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

import { useVideoPlayer } from "./video-player-provider";

import { cn } from "@/utils/cn";
import useClickOutside from "@/hooks/use-click-outside";

type ViewType = { id: string; title: string };

export const VideoPlayerSettings = memo(() => {
    const settingsRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [views, setViews] = useState<ViewType[]>([{ id: "settings", title: "Cài đặt" }]);

    useClickOutside(settingsRef, () => setOpen(false));

    return (
        <div ref={settingsRef} className="flex">
            <button type="button" onClick={() => setOpen(!open)} className="cursor-pointer">
                <Cog6ToothIcon className="size-6 lg:size-8" />
            </button>

            <div
                className={cn(
                    "bg-static-black/80 absolute right-4 bottom-(--controls-height) flex max-h-[calc(var(--container-height)-var(--controls-height))] flex-col gap-2 overflow-hidden overflow-y-auto rounded-lg p-3",
                    { hidden: !open },
                )}
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

                {views.at(-1)?.id === "settings" && (
                    <Settings onViewChange={(view: ViewType) => setViews([...views, view])} />
                )}
                {views.at(-1)?.id === "quality" && <QualitySelector />}
            </div>
        </div>
    );
});
VideoPlayerSettings.displayName = "VideoPlayerSettings";

const Settings = ({ onViewChange }: { onViewChange: (view: ViewType) => void }) => {
    const { currentLevel, manifest } = useVideoPlayer();

    const level = manifest && currentLevel ? manifest.levels[currentLevel.id] : null;

    return (
        <ul className="flex min-w-60 flex-col gap-3">
            <li
                className="flex justify-between gap-4"
                onClick={() => onViewChange({ id: "quality", title: "Chất lượng" })}
            >
                <div className="flex items-center">
                    <AdjustmentsHorizontalIcon className="size-5 stroke-2 lg:size-6" />
                    <span className="ml-2">Chất lượng</span>
                </div>
                <div className="text-subheading-md flex items-center font-light">
                    {currentLevel?.auto && <span>Tự động</span>}
                    {level && <span>&nbsp;({level.name}p)</span>}
                </div>
            </li>

            <li
                className="flex justify-between gap-4"
                onClick={() => onViewChange({ id: "subtitles", title: "Phụ đề" })}
            >
                <div className="flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="size-5 stroke-2 lg:size-6" />
                    <span className="ml-2">Phụ đề</span>
                </div>
                <div className="text-subheading-md flex items-center font-light">Không có</div>
            </li>
            <li
                className="flex justify-between gap-4"
                onClick={() => onViewChange({ id: "playback", title: "Tốc độ phát" })}
            >
                <div className="flex items-center">
                    <ClockIcon className="size-5 stroke-2 lg:size-6" />
                    <span className="ml-2">Tốc độ phát</span>
                </div>
                <div className="text-subheading-md flex items-center font-light">Bình thường</div>
            </li>
        </ul>
    );
};

function QualitySelector() {
    const { manifest, currentLevel, handleChangeQuality } = useVideoPlayer();

    if (!manifest || !currentLevel) return null;

    return (
        <ul className="flex flex-col gap-2">
            <li onClick={() => handleChangeQuality(-1)} className="flex items-center gap-1">
                {currentLevel.auto && <CheckIcon className="size-4 lg:size-5" />}
                <span>Tự động</span>
            </li>

            {manifest.levels.map((level, index) => {
                const isActive = currentLevel.auto ? false : currentLevel.id === index;

                return (
                    <li
                        key={level.name}
                        className={"flex items-center gap-1"}
                        onClick={() => handleChangeQuality(index)}
                    >
                        {isActive && <CheckIcon className="size-4 lg:size-5" />}
                        <span>{level.name}p</span>
                    </li>
                );
            })}
        </ul>
    );
}
