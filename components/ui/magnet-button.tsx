import { Transition as TransitionType } from "motion";
import Image, { type StaticImageData } from "next/image";
import React, { useState, useMemo, forwardRef, useId } from "react";
import { LayoutGroup, motion, MotionConfigContext, MotionStyle } from "motion/react";

import { TextEffect } from "@/components/core/text-effect";
import MagneticHover from "@/components/core/magneti-hover";

import "@/app/styles/magnet-hover.css";

// Transition config cho container chính
const transition: TransitionType = { bounce: 0, delay: 0, duration: 0.5, type: "spring" };

// Hàm chuyển đổi props variant
interface MagnetButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    image: string | StaticImageData;
    // Các prop khác sẽ được truyền vào motion.div
}

// Component Transition: bọc subtree với cấu hình transition được cập nhật qua context
interface TransitionProps {
    value?: TransitionType;
    children: React.ReactNode;
}
const Transition: React.FC<TransitionProps> = ({ value, children }) => {
    const config = React.useContext(MotionConfigContext);
    const transitionValue = value ?? config.transition;
    const contextValue = useMemo(() => ({ ...config, transition: transitionValue }), [transitionValue, config]);
    return <MotionConfigContext.Provider value={contextValue}>{children}</MotionConfigContext.Provider>;
};

// Variants wrapper: dùng để bọc các phần tử có animation variant
const Variants = motion(React.Fragment);

enum STATE {
    OPENED = "opened",
    CLOSED = "closed",
}

const MagnetButton = forwardRef<HTMLDivElement, MagnetButtonProps>((props, ref) => {
    const { image, alt, text } = props;

    const layoutId = useId();
    const [variants, setVariants] = useState<STATE[]>([]);

    const baseVariant = variants.includes(STATE.OPENED) ? STATE.OPENED : STATE.CLOSED;

    // Hàm kiểm tra hiển thị text (chỉ hiện khi variant là "Clicked")
    const open = baseVariant === STATE.OPENED;

    // Định nghĩa các hàm xử lý tap
    const handleTapToDefault = () => setVariants([]);
    const handleTapToClicked = () => setVariants([STATE.OPENED]);

    return (
        <LayoutGroup id={layoutId}>
            <Variants animate={variants} initial={false}>
                <Transition value={transition}>
                    <motion.div
                        ref={ref}
                        data-highlight={true}
                        data-state={baseVariant}
                        layoutId={layoutId + "root"}
                        className="magnet-root magnet-wrapper"
                        onTap={open ? handleTapToDefault : handleTapToClicked}
                    >
                        <motion.div
                            data-border={true}
                            className="magnet-content"
                            layoutId={layoutId + "content"}
                            style={
                                {
                                    "--border-bottom-width": "2px",
                                    "--border-color": "rgba(255, 255, 255, 0.2)",
                                    "--border-left-width": "2px",
                                    "--border-right-width": "2px",
                                    "--border-style": "solid",
                                    "--border-top-width": "2px",
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    borderBottomLeftRadius: 100,
                                    borderBottomRightRadius: 100,
                                    borderTopLeftRadius: 100,
                                    borderTopRightRadius: 100,
                                } as MotionStyle
                            }
                            variants={{
                                [STATE.OPENED]: {
                                    "--border-color": "rgba(255, 255, 255, 0)",
                                    backgroundColor: "rgb(40, 96, 218)",
                                },
                            }}
                        >
                            <motion.div className="magnet-style" layoutId={layoutId + "style"}>
                                <MagneticHover
                                    distance={10}
                                    smoothing={50}
                                    hoverArea={10}
                                    enabled={!open}
                                    style={{ width: "100%", height: "100%" }}
                                >
                                    {{ distance: 8, scale: 0.8 }}
                                </MagneticHover>
                            </motion.div>

                            <motion.div className="magnet-image" layoutId={layoutId + "image"}>
                                <div style={{ position: "absolute", borderRadius: "inherit", inset: "0px" }}>
                                    <Image src={image} alt={alt || ""} width={56} height={56} />
                                </div>
                            </motion.div>

                            {open && (
                                <motion.div className="magnet-text text-static-white font-medium text-nowrap">
                                    <TextEffect per="char" preset="fade" speedReveal={3} speedSegment={3}>
                                        {text}
                                    </TextEffect>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </Transition>
            </Variants>
        </LayoutGroup>
    );
});

MagnetButton.displayName = "MagnetButton";
export default MagnetButton;
