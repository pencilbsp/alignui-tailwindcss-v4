"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const damping = 0.3;

type SwipeOptions = { speed?: number; animated?: boolean };

type Props = {
    loop?: {
        enabled: boolean;
        infinity?: boolean;
    };
    speed?: number;
    freeMode?: {
        sticky?: boolean;
        enabled: boolean;
        momentum?: boolean;
        momentumRatio?: number;
        momentumBounce?: boolean;
        minimumVelocity?: number;
        momentumBounceRatio?: number;
        momentumVelocityRatio?: number;
    };
};

const Slider = ({
    speed = 250,
    loop = { enabled: false, infinity: false },
    freeMode = {
        sticky: false,
        enabled: false,
        momentum: true,
        momentumRatio: 1,
        momentumBounce: true,
        minimumVelocity: 0.02,
        momentumBounceRatio: 1,
        momentumVelocityRatio: 1,
    },
}: Props) => {
    const [index, setIndex] = useState(0);
    const [slideCount, setSlideCount] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const indexRef = useRef(index);

    const gapRef = useRef(0);
    const offsetRef = useRef(0);
    const slideWidthRef = useRef<number | null>(null);

    // Refs cho xử lý pointer events
    const dragStartXRef = useRef(0);
    const dragOffsetRef = useRef(0);
    const dragStartTimeRef = useRef(0);
    const isDraggingRef = useRef(false);

    const swipe = useCallback(
        (offset?: number | SwipeOptions, _options?: SwipeOptions) => {
            if (!containerRef.current || !slideWidthRef.current) return;

            let options: SwipeOptions = _options || {};
            offsetRef.current = -indexRef.current * (slideWidthRef.current + gapRef.current);

            if (typeof offset === "object") {
                options = offset;
                offset = offsetRef.current;
            } else if (typeof offset === "number") {
                offsetRef.current = offset;
            } else {
                offset = offsetRef.current;
            }

            const { animated = true, speed: s = speed } = options;

            containerRef.current.style.transition = animated ? `transform ${s}ms` : "none";
            containerRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
        },
        [speed],
    );

    const computedSlide = useCallback(() => {
        if (!containerRef.current?.parentNode) return;

        const containerStyles = getComputedStyle(containerRef.current as Element);
        const parentWidth = (containerRef.current.parentNode as Element).getBoundingClientRect().width;

        gapRef.current = parseFloat(containerStyles.gap) || 0;
        const slideCount = parseFloat(containerStyles.getPropertyValue("--slide-count")) || 1;
        setSlideCount(slideCount);

        slideWidthRef.current = (parentWidth - gapRef.current * (slideCount - 1)) / slideCount;

        swipe({ animated: false });

        const maxIndex = Math.max(items.length - slideCount, 0);
        if (indexRef.current > maxIndex) setIndex(maxIndex);
    }, [swipe]);

    const canPrev = useMemo(() => loop.enabled || index > 0, [index, loop]);
    const canNext = loop.enabled || index < items.length - (slideCount ?? 0);

    const handlePrev = useCallback(() => {
        if (slideCount === null) return;

        if (loop.enabled) {
            const maxIndex = Math.max(items.length - slideCount, 0);
            return setIndex(index === 0 ? maxIndex : index - 1);
        }

        if (index !== 0) {
            setIndex((prev) => prev - 1);
        }
    }, [index, slideCount, loop]);

    const handleNext = useCallback(() => {
        if (slideCount === null) return;

        const canNext = index < items.length - slideCount;

        if (loop.enabled) {
            return setIndex(canNext ? index + 1 : 0);
        }

        if (canNext) {
            setIndex((prev) => prev + 1);
        }
    }, [index, slideCount, loop]);

    const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
        if (isDraggingRef.current) return;

        isDraggingRef.current = true;
        dragStartXRef.current = event.clientX;
        dragStartTimeRef.current = performance.now();

        // Capture pointer để nhận event ngay cả khi rời khỏi phần tử
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current || !containerRef.current || !slideWidthRef.current) return;

            dragOffsetRef.current = event.clientX - dragStartXRef.current;

            let dragOffset = dragOffsetRef.current;

            // Tính toán maxIndex dựa trên số lượng slide hiển thị
            const maxIndex = items.length - (slideCount ?? 1);

            // Nếu đang ở slide đầu và kéo về bên phải (dragOffset > 0)
            if (indexRef.current === 0 && dragOffset > 0) {
                // Áp dụng damping (giảm độ lệch), bạn có thể điều chỉnh hệ số damping
                dragOffset = dragOffset * damping;
            }
            // Nếu đang ở slide cuối và kéo về bên trái (dragOffset < 0)
            if (indexRef.current === maxIndex && dragOffset < 0) {
                dragOffset = dragOffset * damping;
            }

            const slideOffset = -indexRef.current * (slideWidthRef.current + gapRef.current);

            swipe(slideOffset + dragOffset, { animated: false });
        },
        [slideCount, swipe],
    );

    const handlePointerUp = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            // Nếu không đang trong trạng thái kéo hoặc chưa có thông tin về chiều rộng slide, thì không xử lý gì
            if (!isDraggingRef.current || slideWidthRef.current === null) return;

            // Kết thúc trạng thái kéo
            isDraggingRef.current = false;
            // Giải phóng pointer capture để các sự kiện pointer sau này được xử lý đúng
            event.currentTarget.releasePointerCapture(event.pointerId);

            // Xác định ngưỡng kéo: ở đây là 25% của chiều rộng slide,
            // nghĩa là nếu kéo vượt quá ngưỡng này (hoặc tốc độ kéo cao) thì mới chuyển slide
            const threshold = slideWidthRef.current * 0.25;

            // Tính khoảng thời gian kể từ khi bắt đầu kéo đến thời điểm thả
            const timeDiff = performance.now() - dragStartTimeRef.current;
            // Tính tốc độ kéo (velocity) dựa trên khoảng cách kéo chia cho thời gian kéo
            // Sử dụng Math.abs để lấy giá trị tuyệt đối của drag offset (không quan tâm hướng)
            const velocity = timeDiff > 0 ? Math.abs(dragOffsetRef.current / timeDiff) : 0;

            // Nếu tốc độ kéo lớn hơn 0.25 (đơn vị tùy chọn) hoặc khoảng cách kéo vượt qua ngưỡng,
            // thì thực hiện tính toán chuyển slide
            if (velocity > 0.25 || Math.abs(dragOffsetRef.current) > threshold) {
                // Tính chiều rộng của một item slide bao gồm cả khoảng cách (gap) giữa các slide
                const itemWidth = slideWidthRef.current + gapRef.current;

                // Tính số slide cần chuyển dựa trên tổng khoảng cách kéo (drag offset)
                const delta = Math.round(dragOffsetRef.current / itemWidth);

                if (delta !== 0) {
                    // Tính chỉ số slide mới
                    // Lưu ý: khi kéo sang phải (dragOffset > 0) thì delta dương và ta muốn giảm index,
                    // ngược lại khi kéo sang trái (dragOffset âm) thì delta âm, nên newIndex tăng lên
                    let newIndex = index - delta;

                    // Tính giá trị index tối đa có thể (maxIndex) dựa trên số lượng slide hiện có
                    // Nếu hiển thị nhiều slide cùng lúc, thì index tối đa là tổng số slide trừ đi số slide hiển thị
                    const maxIndex = Math.max(items.length - (slideCount ?? 1), 0);
                    // Giới hạn newIndex trong khoảng từ 0 đến maxIndex để tránh chuyển vượt ngoài phạm vi cho phép
                    newIndex = Math.max(0, Math.min(newIndex, maxIndex));

                    // Nếu chỉ số mới khác với chỉ số hiện tại, cập nhật state để chuyển slide
                    // Nếu bằng nhau, nghĩa là kéo không đủ để chuyển sang slide khác, nên gọi swipe() để snap về vị trí hiện tại
                    if (newIndex !== index) {
                        setIndex(newIndex);
                    } else {
                        swipe();
                    }
                } else {
                    // Nếu kéo sang phải (positive) và có slide trước đó
                    if (dragOffsetRef.current > 0 && index > 0) {
                        setIndex((prev) => prev - 1);
                    }
                    // Nếu kéo sang trái (negative) và có slide tiếp theo
                    else if (dragOffsetRef.current < 0 && index < items.length - (slideCount ?? 1)) {
                        setIndex((prev) => prev + 1);
                    } else {
                        swipe(); // Nếu không đủ điều kiện chuyển slide, snap về vị trí hiện tại
                    }
                }
            } else {
                // Nếu khoảng cách kéo không vượt qua ngưỡng và tốc độ kéo thấp,
                // thì không chuyển slide, chỉ cần snap về vị trí ban đầu
                swipe();
            }
        },
        [index, slideCount, swipe],
    );

    useEffect(() => {
        if (containerRef.current?.parentNode) {
            const resizeObserver = new ResizeObserver(computedSlide);

            resizeObserver.observe(containerRef.current.parentNode as Element);

            return () => resizeObserver.disconnect();
        }
    }, [computedSlide]);

    useEffect(() => {
        indexRef.current = index;
        swipe();
    }, [index, swipe]);

    return (
        <div className="flex justify-center">
            <div className="relative w-full max-w-5xl">
                <div className="w-full overflow-hidden">
                    <div
                        ref={containerRef}
                        onPointerUp={handlePointerUp}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        // onPointerCancel={handlePointerCancel}
                        className="slide-gap-2 slide-3 md:slide-4 flex touch-pan-y select-none"
                    >
                        {items.map((item, _index) => (
                            <div
                                key={_index}
                                className="slide-basis-1/3 md:slide-basis-1/4 aspect-[2/3] w-full flex-shrink-0"
                            >
                                <Image
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    alt={item.title}
                                    src={item.image}
                                    className="pointer-events-none h-full w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    disabled={!canPrev}
                    onClick={handlePrev}
                    className={
                        "text-static-white absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                    }
                >
                    <ChevronLeftIcon className="size-8 stroke-2" />
                </button>
                <button
                    type="button"
                    disabled={!canNext}
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
