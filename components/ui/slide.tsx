"use client";

import Image from "next/image";
import { motion, useAnimate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const items = [
    {
        image: "/mydramalist/qYyBQ8_4f.jpg",
        title: "Justice in the Dark",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/6BgW0_4f.jpg",
        title: "Falling into Your Smile",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/XdvYLg_4f.jpg",
        title: "The Legend of Heroes",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/73dALN_4f.jpg",
        title: "The Best Thing",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/yWODkN_4f.jpg",
        title: "Undercover High School",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/v24Pg_4f.jpg",
        title: "Business Proposal",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/6nYyXf.jpg",
        title: "The Secret Life of My Secretary",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/73dovN_4f.jpg",
        title: "Your Kiss Mark Won't Go Away",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/Ndb5lR_4f.jpg",
        title: "Grab Your Love",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/g0Ne5n_4f.jpg",
        title: "Good Will Society",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/KpK5dn_3f.jpg",
        title: "The Cage of Karawek",
        status: "completed",
        update: "Cập nhật tập 12",
    },
    {
        image: "/mydramalist/x4YgEN_4f.jpg",
        title: "Northward",
        status: "completed",
        update: "Cập nhật tập 12",
    },
];

const isTouchDevice = () =>
    typeof window !== "undefined" ? "ontouchstart" in window || navigator.maxTouchPoints > 0 : false;

const Slider = () => {
    const [canNext, setCanNext] = useState(false);
    const [canPrev, setCanPrev] = useState(false);
    const [containerRef, animate] = useAnimate<HTMLDivElement>();

    const [maxTranslate, setMaxTranslate] = useState<number>();

    const gapRef = useRef(0);
    const indexRef = useRef(0);
    const translateRef = useRef(0);
    const slidePerViewRef = useRef<null | number>(null);
    const snapGridRef = useRef<{ width: number; translate: number }[]>([]);

    // Xử lý chuyển slide sang bên trái (Next)
    const handleNext = () => {
        if (slidePerViewRef.current === null || indexRef.current === items.length - slidePerViewRef.current) return;

        indexRef.current += 1;
        const newX = snapGridRef.current[indexRef.current].translate;
        animate(containerRef.current, { x: newX }, { ease: "easeInOut", duration: 0.3 });
    };

    // Xử lý chuyển slide sang bên phải (Prev)
    const handlePrev = () => {
        if (indexRef.current === 0) return;

        indexRef.current -= 1;
        const newX = snapGridRef.current[indexRef.current].translate;
        animate(containerRef.current, { x: newX }, { ease: "easeInOut", duration: 0.3 });
    };

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            const resizeObserver = new ResizeObserver(() => {
                const styles = getComputedStyle(container);

                gapRef.current = parseFloat(styles.gap);
                slidePerViewRef.current = parseInt(styles.getPropertyValue("--slide-count"));

                snapGridRef.current = Array.from(container.childNodes).map((elm, index) => {
                    const width = (elm as HTMLDivElement).offsetWidth;
                    const translate = -index * (width + gapRef.current);
                    return { width, translate };
                });

                // Cập nhật maxTranslate dựa trên tổng chiều rộng
                setMaxTranslate((container.scrollWidth - container.offsetWidth) * -1);

                // Nếu index hiện tại vượt quá giới hạn mới, điều chỉnh lại
                const maxIndex = items.length - slidePerViewRef.current;
                if (indexRef.current > maxIndex) {
                    indexRef.current = maxIndex;
                }

                animate(
                    container,
                    { x: snapGridRef.current[indexRef.current].translate },
                    { duration: 0 }, // có thể tắt animation để update nhanh
                );
            });

            resizeObserver.observe(container.parentNode as Element);
            setMaxTranslate((container.scrollWidth - container.offsetWidth) * -1);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [containerRef, animate]);

    return (
        <div className="flex justify-center">
            <div className="relative w-full max-w-5xl overflow-hidden p-4 sm:overflow-visible">
                <motion.div className="w-full overflow-visible sm:overflow-hidden">
                    <motion.div
                        drag={isTouchDevice() ? "x" : undefined}
                        ref={containerRef}
                        dragConstraints={{
                            right: 0,
                            left: maxTranslate,
                        }}
                        dragTransition={{ power: 0.7, timeConstant: 250 }}
                        onUpdate={({ x }: { x: number; y: number }) => {
                            translateRef.current = x;
                            indexRef.current = snapGridRef.current.findIndex(
                                ({ translate, width }) => x >= translate - width * 0.85,
                            );
                        }}
                        className="slide-gap-2 slide-3 xs:slide-4 sm:slide-5 flex touch-pan-y"
                    >
                        {items.map((item, _index) => (
                            <motion.div
                                key={_index}
                                className="slide-basis-1/3 xs:slide-basis-1/4 sm:slide-basis-1/5 relative w-full flex-shrink-0"
                            >
                                <div className="h-full w-full pb-[145%]">
                                    <div className="absolute top-0 left-0 h-full w-full">
                                        <Image
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            alt={item.title}
                                            src={item.image}
                                            className="pointer-events-none h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
                <button
                    type="button"
                    onClick={handlePrev}
                    className="text-static-white absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer disabled:opacity-50 hidden md:block"
                >
                    <ChevronLeftIcon className="size-8 stroke-2" />
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="text-static-white absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer disabled:opacity-50 hidden md:block"
                >
                    <ChevronRightIcon className="size-8 stroke-2" />
                </button>
            </div>
        </div>
    );
};

export default Slider;
