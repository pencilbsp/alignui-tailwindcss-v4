// import Carousel from "@/components/ui/carousel";
// import Slide from "@/components/ui/slide";
// import NativeCarousel from "@/components/ui/native-carousel";

import VideoPlayer from "@/components/ui/video-player";
import VideoPlayerProvider from "@/components/ui/video-player-provider";

export default function Home() {
    return (
        <div className="flex w-full flex-col justify-center">
            {/* <Carousel /> */}

            {/* <Slide /> */}

            <div className="aspect-video h-full w-full max-w-4xl">
                <VideoPlayerProvider src="http://sample.vodobox.com/we_are_blood_4k/we_are_blood_4k.m3u8">
                    <VideoPlayer />
                </VideoPlayerProvider>
            </div>
        </div>
    );
}
