import { useState, useEffect } from "react";

const useResponsive = (query: string = "(max-width: 767px)") => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        // Cập nhật trạng thái ban đầu
        setIsMobile(mediaQueryList.matches);

        // Thêm event listener cho sự thay đổi của media query
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener("change", listener);
        } else {
            // Hỗ trợ cho các trình duyệt cũ hơn
            mediaQueryList.addListener(listener);
        }

        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener("change", listener);
            } else {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return isMobile;
};

export default useResponsive;
