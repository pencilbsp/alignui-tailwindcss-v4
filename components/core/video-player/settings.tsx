import { AnimatePresence, motion } from "motion/react";
import { ElementType, memo, useMemo, useRef } from "react";
import {
    RiTimerLine,
    RiSettings2Line,
    RiEqualizer3Line,
    RiArrowLeftSLine,
    RemixiconComponentType,
    RiClosedCaptioningLine,
    RiArrowLeftLine,
} from "@remixicon/react";

import { cn } from "@/utils/cn";
import ControlButton from "./control-button";
import * as Divider from "@/components/core/divider";
import useClickOutside from "@/hooks/use-click-outside";
import { PolymorphicComponentProps } from "@/utils/polymorphic";
import { useVideoPlayer, type SettingView, settings, SettingsName } from "./store";
import SettingLevelSelect from "./setting-level-select";
import SettingSubtitleSelect from "./setting-subtitle-select";
import SettingPlaybackRateSelect from "./setting-playback-rate-select";
import SettingSelectItem from "./setting-select-item";

enum MotionAttribute {
    toLeft = "toLeft",
    toRight = "toRight",
}

type Props = {};

function VideoPlayerSettings<T extends ElementType>({
    as,
    // settings,
    className,
    ...rest
}: PolymorphicComponentProps<T, Props>) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const previousSettings = useRef<SettingView[] | null>(null);

    const settingsVisible = useVideoPlayer((state) => state.settingsVisible);
    const setSettingsVisible = useVideoPlayer((state) => state.setSettingsVisible);

    const Component = as || "div";
    const view = useMemo(() => {
        if (Array.isArray(settingsVisible) && settingsVisible.length > 0) {
            const current = settingsVisible.at(-1)!;
            const previous = settingsVisible.at(-2);
            return { current, previous };
        }
    }, [settingsVisible]);

    const closeSettings = () => {
        previousSettings.current = settingsVisible;
        setSettingsVisible(null);
    };

    const toggleSettings = () => {
        previousSettings.current = settingsVisible;
        setSettingsVisible(view ? null : [settings.ROOT]);
    };

    const toNextSettings = (view: SettingView) => {
        if (Array.isArray(settingsVisible)) {
            previousSettings.current = settingsVisible;
            setSettingsVisible([...settingsVisible, view]);
        }
    };

    const toPreviousSettings = () => {
        if (Array.isArray(settingsVisible)) {
            previousSettings.current = settingsVisible;
            setSettingsVisible(settingsVisible.slice(0, -1));
        }
    };

    useClickOutside(rootRef, closeSettings);

    return (
        <Component ref={rootRef} className={cn("flex", className)} {...rest}>
            <ControlButton
                icon={RiSettings2Line}
                onClick={toggleSettings}
                aria-label={view ? "Close settings" : "Open settings"}
            />

            <AnimatePresence>
                {view ? (
                    <motion.div
                        exit={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 10 }}
                        className="bg-static-black/80 shadow-regular-xs absolute right-4 bottom-full flex flex-col overflow-hidden rounded-xl p-2 ring ring-neutral-200/20 ring-inset"
                    >
                        {view.current.id === SettingsName.ROOT ? (
                            <MainSettings toNextSettings={toNextSettings} />
                        ) : (
                            <SubSettings view={view} toPreviousSettings={toPreviousSettings} />
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </Component>
    );
}

const SettingsItem = memo(
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
            <SettingSelectItem onClick={() => onViewChange(view)}>
                <div className="flex items-center">
                    {Icon && <Icon className="size-5 lg:size-6" />}
                    <span className="ml-2">{view.title}</span>
                </div>
                <div className="text-subheading-sm lg:text-subheading-md text-text-soft-400 flex items-center font-light">
                    {value}
                </div>
            </SettingSelectItem>
        );
    },
);

SettingsItem.displayName = "SettingsItem";

type MainSettingsProps = {
    toNextSettings: (view: SettingView) => void;
};

const MainSettings = memo(({ toNextSettings }: MainSettingsProps) => {
    // console.log("motionAttribute", motionAttribute);

    const manifest = useVideoPlayer((state) => state.manifest);
    const currentLevel = useVideoPlayer((state) => state.currentLevel);
    const playbackRate = useVideoPlayer((state) => state.playbackRate);
    const subtitleTrack = useVideoPlayer((state) => state.subtitleTrack);

    const level = useMemo(
        () => (manifest && currentLevel ? manifest.levels[currentLevel.id] : null),
        [manifest, currentLevel],
    );

    const subtitle = useMemo(
        () => (manifest && subtitleTrack ? manifest.subtitleTracks[subtitleTrack.id] : null),
        [manifest, subtitleTrack],
    );

    return (
        <ul className="flex flex-col gap-1">
            {currentLevel && (
                <SettingsItem
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
                <SettingsItem
                    view={settings.SUBTITLE}
                    icon={RiClosedCaptioningLine}
                    onViewChange={toNextSettings}
                    value={subtitle ? subtitle.name : "Tắt"}
                />
            )}
            <SettingsItem
                icon={RiTimerLine}
                view={settings.PLAYBACK_RATE}
                onViewChange={toNextSettings}
                value={playbackRate.label || playbackRate.value}
            />
        </ul>
    );
});

MainSettings.displayName = "MainSettings";

type SubSettingsProps = {
    toPreviousSettings: VoidFunction;
    view: { current: SettingView; previous?: SettingView };
};

const SubSettings = memo(({ view, toPreviousSettings }: SubSettingsProps) => {
    return (
        <div className="flex flex-col gap-1">
            {view.previous && (
                <button className="flex cursor-pointer items-center px-2 py-1" onClick={toPreviousSettings}>
                    <RiArrowLeftLine className="mr-1.5 size-4 lg:size-5" />
                    <span>{view.previous.title}</span>
                </button>
            )}

            <Divider.Root variant="line-spacing" />

            {view.current.id === SettingsName.LEVEL && <SettingLevelSelect />}
            {view.current.id === SettingsName.SUBTITLE && <SettingSubtitleSelect />}
            {view.current.id === SettingsName.PLAYBACK_RATE && <SettingPlaybackRateSelect />}
        </div>
    );
});

SubSettings.displayName = "SubSettings";

export default memo(VideoPlayerSettings);
