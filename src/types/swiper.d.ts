declare module "swiper/types/swiper-options" {
  export interface SwiperOptions {
    centeredSlides?: boolean;
    followFinger?: boolean;
    grabCursor?: boolean;
    spaceBetween?: number;
    slidesPerView?: number | "auto";
    [key: string]: unknown;
  }
}
