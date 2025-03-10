"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const items = [
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

const Slider = () => {
    const [index, setIndex] = useState(0);
    const [slidePerView, setSlidePerView] = useState<number | null>(null);

    const gapRef = useRef(0);
    const offsetRef = useRef(0);
    const currentIndexRef = useRef(index);
    const itemWidthRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs cho xử lý pointer events
    const dampingFactor = 0.3;
    const dragStartXRef = useRef(0);
    const dragOffsetRef = useRef(0);
    const dragStartTimeRef = useRef(0);
    const isDraggingRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    const getEffectiveWidth = () => (itemWidthRef.current ? itemWidthRef.current + gapRef.current : 0);

    // Hàm updateSlider nhận thêm tham số immediate
    const updateSlider = useCallback((immediate = false) => {
        if (!containerRef.current?.parentNode) return;
        const parentWidth = (containerRef.current.parentNode as HTMLElement).getBoundingClientRect().width;
        const styles = getComputedStyle(containerRef.current);
        const gap = parseFloat(styles.gap) || 0;
        const slideCount = parseFloat(styles.getPropertyValue("--slide-count")) || 1;

        gapRef.current = gap;
        itemWidthRef.current = (parentWidth - gap * (slideCount - 1)) / slideCount;
        setSlidePerView(slideCount);

        const currentIndex = currentIndexRef.current;
        const maxIndex = Math.max(items.length - slideCount, 0);
        if (currentIndex > maxIndex) {
            setIndex(maxIndex);
            currentIndexRef.current = maxIndex;
            return;
        }

        const effectiveWidth = getEffectiveWidth();
        offsetRef.current = -currentIndex * effectiveWidth;
        if (containerRef.current) {
            containerRef.current.style.transition = immediate ? "none" : "transform 0.3s ease-in-out";
            containerRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
    }, []);

    useEffect(() => {
        currentIndexRef.current = index;
        updateSlider();
    }, [index, updateSlider]);

    const handleNext = useCallback(() => {
        if (slidePerView === null) return;
        if (index < items.length - slidePerView) {
            setIndex((prev) => prev + 1);
        }
    }, [index, slidePerView]);

    const handlePrev = useCallback(() => {
        if (index > 0) {
            setIndex((prev) => prev - 1);
        }
    }, [index]);

    const computedCanPrev = index > 0;
    const computedCanNext = slidePerView !== null && index < items.length - slidePerView;

    const updatePointerMove = () => {
        const effectiveWidth = getEffectiveWidth();
        if (!effectiveWidth) return;

        const maxIndex = Math.max(items.length - (slidePerView || 1), 0);
        const minOffset = -(maxIndex * effectiveWidth);
        let newOffset = offsetRef.current + dragOffsetRef.current;

        // Áp dụng damping nếu kéo vượt quá giới hạn
        if (newOffset > 0) {
            newOffset = newOffset * dampingFactor;
        } else if (newOffset < minOffset) {
            newOffset = minOffset + (newOffset - minOffset) * dampingFactor;
        }
        if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${newOffset}px, 0, 0)`;
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        dragStartTimeRef.current = performance.now();
        if (containerRef.current) {
            containerRef.current.style.transition = "none";
        }
        // Capture pointer để nhận event ngay cả khi rời khỏi phần tử
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;
        const delta = e.clientX - dragStartXRef.current;
        dragOffsetRef.current = delta;
        if (animationFrameRef.current === null) {
            animationFrameRef.current = requestAnimationFrame(() => {
                updatePointerMove();
                animationFrameRef.current = null;
            });
        }
    };

    const handlePointerUp = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        if (containerRef.current) {
            containerRef.current.style.transition = "transform 0.3s ease-in-out";
        }
        const effectiveWidth = getEffectiveWidth();
        if (!effectiveWidth) return;

        const dt = performance.now() - dragStartTimeRef.current;
        const velocity = dt > 0 ? dragOffsetRef.current / dt : 0;
        let momentum = velocity * 200;
        momentum = Math.max(Math.min(momentum, effectiveWidth * 2), -effectiveWidth * 2);

        let newOffset = offsetRef.current + dragOffsetRef.current + momentum;
        const maxIndex = Math.max(items.length - (slidePerView || 1), 0);
        const minOffset = -(maxIndex * effectiveWidth);
        if (newOffset > 0) {
            newOffset = 0;
        } else if (newOffset < minOffset) {
            newOffset = minOffset;
        }
        const slideChange = Math.round((offsetRef.current - newOffset) / effectiveWidth);
        let newIndex = index + slideChange;
        newIndex = Math.max(0, Math.min(newIndex, maxIndex));

        if (newIndex === index) {
            updateSlider();
        } else {
            setIndex(newIndex);
        }
        dragOffsetRef.current = 0;
    };

    // Xử lý onPointerCancel: tương tự như onPointerUp
    const handlePointerCancel = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (containerRef.current) {
            containerRef.current.style.transition = "transform 0.3s ease-in-out";
        }
        updateSlider();
        dragOffsetRef.current = 0;
    };

    // Sử dụng ResizeObserver: gọi updateSlider với immediate = true
    useEffect(() => {
        if (containerRef.current?.parentNode) {
            const resizeObserver = new ResizeObserver(() => {
                updateSlider(true);
            });
            resizeObserver.observe(containerRef.current.parentNode as Element);
            return () => resizeObserver.disconnect();
        }
    }, [updateSlider]);

    return (
        <div className="flex justify-center">
            <div className="relative w-full max-w-5xl">
                <div className="w-full overflow-hidden">
                    <div
                        ref={containerRef}
                        onPointerUp={handlePointerUp}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerCancel={handlePointerCancel}
                        className="slide-gap-2 md:slide-gap-3 slide-3 md:slide-4 flex touch-pan-y select-none"
                    >
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="slide-basis-1/3 md:slide-basis-1/4 aspect-[2/3] w-full flex-shrink-0"
                            >
                                <Image
                                    alt={item.title}
                                    src={item.image}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="pointer-events-none h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    disabled={!computedCanPrev}
                    onClick={handlePrev}
                    className="text-static-white absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                >
                    <ChevronLeftIcon className="size-8 stroke-2" />
                </button>
                <button
                    type="button"
                    disabled={!computedCanNext}
                    onClick={handleNext}
                    className="text-static-white absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                >
                    <ChevronRightIcon className="size-8 stroke-2" />
                </button>
            </div>
        </div>
    );
};

export default Slider;
