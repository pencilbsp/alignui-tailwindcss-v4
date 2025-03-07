"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { cn } from "@/utils/cn";

import "@/app/styles/carousel.css";

const mock = [
    {
        image: "/unsplash/photo-1448376561459-dbe8868fa34c",
        title: "Tiêu đề ảnh 01",
        avg_rating: 9.4,
        year: 2025,
        age_rating: "T13",
        update: "Cập nhật tập 44",
        genres: ["Lãng mạn", "Tình cảm", "Tâm lý", "Hành động"],
    },
    {
        image: "/unsplash/photo-1448070299168-7dede6dc70b4",
        title: "Tiêu đề ảnh 02",
        avg_rating: 7.5,
        year: 2023,
        age_rating: "T13",
        update: "Cập nhật tập 33",
        genres: ["Hài hước", "Kinh dị", "Tâm lý", "Hành động"],
    },
    {
        image: "/unsplash/photo-1448074811603-337a7a81a52b",
        title: "Tiêu đề ảnh 03",
        avg_rating: 8.1,
        year: 2024,
        age_rating: "T13",
        update: "Cập nhật tập 22",
        genres: ["Hành động", "Tình cảm", "Tâm lý", "Chính kịch"],
    },
    {
        image: "/unsplash/photo-1615561077098-98bc02c24ede",
        title: "Tiêu đề ảnh 04",
        avg_rating: 8.6,
        year: 2024,
        age_rating: "T13",
        update: "Cập nhật tập 11",
        genres: ["Lãng mạn", "Tình cảm", "Tâm lý", "Hành động"],
    },
    {
        image: "/unsplash/photo-1520121401995-928cd50d4e27",
        title: "Tiêu đề ảnh 05",
        avg_rating: 9.2,
        year: 2020,
        age_rating: "T13",
        update: "Cập nhật tập 7",
        genres: ["Lãng mạn", "Tình cảm", "Tâm lý", "Hành động"],
    },
];

export default function Carousel() {
    // action: trạng thái chuyển động "next" hoặc "prev"
    const [action, setAction] = useState<"next" | "prev" | null>(null);
    // slides: mảng chứa các index của slide: [slide trước, slide hiện tại, slide tiếp theo]
    const [slides, setSlides] = useState([mock.length - 1, 0, 1]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const next = useCallback(() => {
        if (!action) {
            setAction("next");
            // Đồng bộ thời gian với CSS transition (1000ms)
            timerRef.current = setTimeout(() => {
                setSlides((prev) => prev.map((index) => (index === mock.length - 1 ? 0 : index + 1)));
                setAction(null);
            }, 1000);
        }
    }, [action]);

    const previous = useCallback(() => {
        if (!action) {
            setAction("prev");
            timerRef.current = setTimeout(() => {
                setSlides((prev) => prev.map((index) => (index === 0 ? mock.length - 1 : index - 1)));
                setAction(null);
            }, 1000);
        }
    }, [action]);

    useEffect(() => {
        if (!action) {
            const autoplayTimer = setTimeout(next, 5000);
            return () => clearTimeout(autoplayTimer);
        }
    }, [action, next]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div className="w-full max-w-5xl p-6">
            <div className="relative overflow-hidden pb-[56.25%]">
                <div
                    className={cn("absolute top-0 left-0 h-full w-full", {
                        "go-next": action === "next",
                        "go-prev": action === "prev",
                    })}
                >
                    {slides.map((index) => {
                        const slide = mock[index];
                        const isNext = index === slides[2];
                        const isPrev = index === slides[0];
                        const isCurrent = index === slides[1];

                        return (
                            <div
                                key={index}
                                className={cn("carousel-background p-4", {
                                    "background-prev": isPrev,
                                    "background-next": isNext,
                                    "background-current": isCurrent,
                                })}
                                style={{ backgroundImage: `url('${slide.image}')` }}
                            >
                                <div
                                    className={cn("carousel-meta", {
                                        "meta-prev": isPrev,
                                        "meta-next": isNext,
                                        "meta-current": isCurrent,
                                    })}
                                >
                                    <div className="flex">{slide.title}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={previous}
                    className="text-static-white absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer"
                >
                    <ChevronLeftIcon className="size-8 stroke-2" />
                </button>
                <button
                    type="button"
                    onClick={next}
                    className="text-static-white absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                >
                    <ChevronRightIcon className="size-8 stroke-2" />
                </button>
            </div>
        </div>
    );
}
