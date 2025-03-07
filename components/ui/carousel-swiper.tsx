"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const mockImages = [
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

export default function CarouselSwiper() {
    return (
        <div className="w-full max-w-6xl p-6">
            <Swiper modules={[EffectFade, Autoplay, Pagination, Navigation]} speed={500} autoplay={{ delay: 5000 }} loop slidesPerView={3} pagination navigation>
                {mockImages.map((src, index) => {
                    return (
                        <SwiperSlide key={index}>
                            <div className="aspect-video">
                                <Image
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    loading="lazy"
                                    src={src.image}
                                    alt="Mock Image"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
