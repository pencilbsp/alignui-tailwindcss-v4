import { AnimatePresence } from "motion/react";
import { ElementType, HTMLAttributes, memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
    RiTimerLine,
    RiSettings2Line,
    RiEqualizer3Line,
    RemixiconComponentType,
    RiClosedCaptioningLine,
} from "@remixicon/react";

import ControlButton from "./control-button";
import useClickOutside from "@/hooks/use-click-outside";
import { PolymorphicComponentProps } from "@/utils/polymorphic";
import { useVideoPlayer, type SettingView, settings, SettingsName } from "./store";
import { cn } from "@/utils/cn";

// enum MotionAttribute {
//     TO_END = "to-end",
//     FROM_END = "from-end",
//     TO_START = "to-start",
//     FROM_START = "from-start",
// }

type Props = {};

function VideoPlayerSettings<T extends ElementType>({
    as,
    // settings,
    className,
    ...rest
}: PolymorphicComponentProps<T, Props>) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    const closeSettings = useVideoPlayer((state) => state.closeSettings);
    const toggleSettings = useVideoPlayer((state) => state.toggleSettings);
    const settingsVisible = useVideoPlayer((state) => state.settingsVisible);

    const Component = as || "div";
    const isOpen = Array.isArray(settingsVisible) && settingsVisible.length > 0;

    useClickOutside(rootRef, closeSettings);

    return (
        <Component ref={rootRef} className={cn("flex", className)} {...rest}>
            <ControlButton
                icon={RiSettings2Line}
                onClick={toggleSettings}
                aria-label={isOpen ? "Close settings" : "Open settings"}
            />

            <AnimatePresence>
                {isOpen ? (
                    <div className="bg-static-black/80 shadow-regular-xs absolute right-4 bottom-full flex flex-col rounded-lg p-4 ring ring-neutral-200/20 ring-inset">
                        <SettingsRoot />
                    </div>
                ) : null}
            </AnimatePresence>
        </Component>
    );
}

const SettingsRootItem = memo(
    ({
        view,
        value,
        icon: Icon,
        onViewChange,
    }: {
        view: SettingView;
        icon?: RemixiconComponentType;
        value: string | React.ReactNode;
        onViewChange: (view: SettingView) => void;
    }) => {
        return (
            <li className="flex cursor-pointer justify-between gap-4" onClick={() => onViewChange(view)}>
                <div className="flex items-center">
                    {Icon && <Icon className="size-5 lg:size-6" />}
                    <span className="ml-2">{view.title}</span>
                </div>
                <div className="text-subheading-sm lg:text-subheading-md text-text-soft-400 flex items-center font-light">
                    {value}
                </div>
            </li>
        );
    },
);

SettingsRootItem.displayName = "SettingsRootItem";

const SettingsRoot = memo(() => {
    const manifest = useVideoPlayer((state) => state.manifest);
    const currentLevel = useVideoPlayer((state) => state.currentLevel);
    const playbackRate = useVideoPlayer((state) => state.playbackRate);
    const subtitleTrack = useVideoPlayer((state) => state.subtitleTrack);
    const toNextSettings = useVideoPlayer((state) => state.toNextSettings);

    const level = useMemo(
        () => (manifest && currentLevel ? manifest.levels[currentLevel.id] : null),
        [manifest, currentLevel],
    );

    const subtitle = useMemo(
        () => (manifest && subtitleTrack ? manifest.subtitleTracks[subtitleTrack.id] : null),
        [manifest, subtitleTrack],
    );

    return (
        <ul className="flex flex-col gap-4 lg:gap-4">
            {currentLevel && (
                <SettingsRootItem
                    view={settings.LEVEL}
                    icon={RiEqualizer3Line}
                    onViewChange={toNextSettings}
                    value={
                        <>
                            {currentLevel.auto && <span>Tự động</span>}
                            {level && <span>&nbsp;{level.label}</span>}
                        </>
                    }
                />
            )}
            {subtitleTrack && (
                <SettingsRootItem
                    view={settings.SUBTITLE}
                    icon={RiClosedCaptioningLine}
                    onViewChange={toNextSettings}
                    value={subtitle ? subtitle.name : "Tắt"}
                />
            )}
            <SettingsRootItem
                icon={RiTimerLine}
                view={settings.PLAYBACK_RATE}
                onViewChange={toNextSettings}
                value={playbackRate.label || playbackRate.value}
            />
        </ul>
    );
});

SettingsRoot.displayName = "SettingsRoot";

// const SettingsRoot = memo(
//     ({
//         views,
//         prevViews,
//     }: {
//         views: { current: SettingView; previous: SettingView | null };
//         prevViews: { current: SettingView | null; previous: SettingView | null };
//     }) => {
//         const [_motion, setMotion] = useState(true);

//         const divRef = useRef<HTMLDivElement | null>(null);
//         const motionTimeoutRef = useRef<number | null>(null);

//         const setSettingsVisible = useVideoPlayer((state) => state.setSettingsVisible);

//         const handleBackView = useCallback(
//             (view: SettingView) => {
//                 if (motionTimeoutRef.current) {
//                     clearTimeout(motionTimeoutRef.current);
//                 }

//                 if (!divRef.current) return;

//                 divRef.current.dataset.motion = MotionAttribute.TO_END;

//                 motionTimeoutRef.current = window.setTimeout(() => {
//                     setSettingsVisible([view]);
//                 }, 200);
//             },
//             [setSettingsVisible],
//         );

//         useEffect(() => {
//             if (divRef.current && views.current && views.current.id !== SettingsName.ROOT) {
//                 divRef.current.dataset.motion = MotionAttribute.FROM_END;
//                 setMotion(true);
//             }

//             if (motionTimeoutRef.current) {
//                 // setMotion(true);

//                 clearTimeout(motionTimeoutRef.current);
//             }
//         }, [views]);

//         return (
//             <motion.div
//                 key="settings"
//                 exit={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 initial={{ y: 10, opacity: 0 }}
//                 transition={{ duration: 0.2 }}
//                 className="bg-static-black/80 shadow-regular-xs absolute right-4 bottom-full overflow-hidden rounded-xl p-4 ring-1 ring-neutral-200/20 ring-inset"
//             >
//                 {views.current.id === SettingsName.ROOT && <SettingList />}

//                 {views.previous && (
//                     <div
//                         ref={divRef}
//                         className="data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left flex flex-col gap-2 lg:gap-3"
//                     >
//                         <button
//                             aria-label={`Quay lại ${views.previous.title}`}
//                             className="flex cursor-pointer items-center gap-2"
//                             onClick={() => handleBackView(views.previous!)}
//                         >
//                             <RiArrowLeftSLine className="size-5 lg:size-6" />
//                             <span>{views.previous.title}</span>
//                         </button>

//                         {views.current.id === SettingsName.LEVEL && <QualitySelector />}
//                     </div>
//                 )}

//                 {/* {views.current.id === SettingsName.SUBTITLE && <SubtitleSelector />}
//             {views.current.id === SettingsName.PLAYBACK_RATE && <PlaybackRateSelector />} */}
//             </motion.div>
//         );
//     },
// );

// SettingsRoot.displayName = "SettingsRoot";

// export default VideoPlayerSettings;

export default memo(VideoPlayerSettings);
