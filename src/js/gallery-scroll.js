let galleryObserver = null;

export function restartScrollAnimation() {
  const items = document.querySelectorAll('.gallery__item');
  items.forEach(item => item.classList.remove('visible'));

  if (galleryObserver) {
    galleryObserver.disconnect();
    galleryObserver = null;
  }
}

export function animateGalleryItems() {
  const items = document.querySelectorAll('.gallery__item');

  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }

  if (galleryObserver) {
    galleryObserver.disconnect();
  }

  galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.2
  });

  items.forEach(item => {
    item.classList.remove('visible');
    galleryObserver.observe(item);
  });
}

document.addEventListener('DOMContentLoaded', animateGalleryItems);

window.addEventListener('resize', () => {
  clearTimeout(window._galleryResizeTimeout);
  window._galleryResizeTimeout = setTimeout(animateGalleryItems, 200);
});
