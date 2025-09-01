import Swiper from 'swiper';
import 'swiper/css';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.welcome-swiper');
  if (!container) return;

  const paginationEl = document.querySelector('.hero-slider__pagination');
  const nextEl = document.querySelector('.hero-slider__arrow--right');
  const prevEl = document.querySelector('.hero-slider__arrow--left');
  const textEl = document.querySelector('#hero-slider-text');

  const swiper = new Swiper(container, {
    modules: [Navigation, Pagination, Autoplay],
    loop: true,
    speed: 500,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: paginationEl,
      clickable: true,
      bulletClass: 'hero-slider__dot',
      bulletActiveClass: 'hero-slider__dot--active',
      renderBullet: (index, className) => `<span class="${className}"></span>`,
    },
    navigation: {
      nextEl,
      prevEl,
    },
    slidesPerView: 1,
    spaceBetween: 40,
    on: {
      init: function () {
        updateSliderText(this);
      },
      slideChange: function () {
        updateSliderText(this);
      }
    }
  });

  function updateSliderText(swiperInstance) {
    if (!textEl) return;
    const current = String(swiperInstance.realIndex + 1).padStart(2, '0');
    const total = '05';
    textEl.innerHTML = `${current}&nbsp;|&nbsp;${total}`;
  }
});