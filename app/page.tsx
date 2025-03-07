import Carousel from "@/components/ui/carousel";
import CarouselSwiper from "@/components/ui/carousel-swiper";

export default function Home() {
    return (
        <div className="flex w-full flex-col justify-center p-4">
            <Carousel />
            <CarouselSwiper />
        </div>
    );
}
