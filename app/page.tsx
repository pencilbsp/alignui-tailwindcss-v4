// import Carousel from "@/components/ui/carousel";
// import Slide from "@/components/ui/slide";
// import NativeCarousel from "@/components/ui/native-carousel";

import VideoPlayer from "@/components/ui/video-player";
import VideoPlayerProvider from "@/components/core/video-player/provider";

export default function Home() {
    return (
        <div className="flex w-full flex-col justify-center">
            {/* <Carousel /> */}

            {/* <Slide /> */}

            <div className="mx-auto aspect-video h-full w-full max-w-6xl">
                <VideoPlayerProvider
                    // subtitles={[
                    //     {
                    //         lang: "en",
                    //         name: "English",
                    //         src: "http://localhost:3000/videos/video.vtt",
                    //     },
                    // ]}
                    src="http://localhost:3000/videos/master.m3u8"
                >
                    <VideoPlayer />
                </VideoPlayerProvider>
            </div>
        </div>
    );
}
