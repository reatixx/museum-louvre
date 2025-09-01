import { restartScrollAnimation, animateGalleryItems } from './gallery-scroll.js';

function reorderGallery() {
  const columns = document.querySelectorAll('.gallery__column');
  if (columns.length < 3) return;

  const [col1, col2, col3] = columns;
  const allItems = [...document.querySelectorAll('.gallery__item')];
  if (allItems.length === 0) return;

  const getItem = (filename) => {
    return allItems.find((item) => {
      const img = item.querySelector('img');
      return img && img.dataset.filename === filename;
    });
  };

  [col1, col2, col3].forEach(col => {
    while (col.firstChild) col.removeChild(col.firstChild);
  });

  const usedItems = new Set();
  const width = window.innerWidth;

  const appendBatch = (names, column) => {
    const fragment = document.createDocumentFragment();
    names.forEach((name) => {
      const item = getItem(name);
      if (item && !usedItems.has(item)) {
        fragment.appendChild(item);
        usedItems.add(item);
      }
    });
    column.appendChild(fragment);
  };

  if (width < 768) {
    appendBatch(['galery7', 'galery5', 'galery14'], col1);
    appendBatch(['galery9', 'galery10', 'galery12', 'galery4'], col2);
  } else if (width >= 768 && width < 1024) {
    appendBatch(['galery4', 'galery7', 'galery11'], col1);
    appendBatch(['galery13', 'galery12', 'galery9', 'galery10'], col2);
  } else if (width >= 1024 && width < 1920) {
    appendBatch(['galery1', 'galery2', 'galery11', 'galery5'], col1);
    appendBatch(['galery7', 'galery8', 'galery13', 'galery14'], col2);
    appendBatch(['galery12', 'galery3', 'galery4', 'galery6'], col3);
  } else if (width >= 1920) {
    const fullOrder = [
      'galery2','galery1','galery7','galery9','galery8','galery10',
      'galery4','galery3','galery15','galery6','galery5','galery12'
    ];
    const fragment1 = document.createDocumentFragment();
    const fragment2 = document.createDocumentFragment();
    const fragment3 = document.createDocumentFragment();

    fullOrder.forEach((name, index) => {
      const item = getItem(name);
      if (item && !usedItems.has(item)) {
        if (index % 3 === 0) fragment1.appendChild(item);
        else if (index % 3 === 1) fragment2.appendChild(item);
        else fragment3.appendChild(item);
        usedItems.add(item);
      }
    });

    col1.appendChild(fragment1);
    col2.appendChild(fragment2);
    col3.appendChild(fragment3);
  }

  if (usedItems.size < allItems.length) {
    const fragment = document.createDocumentFragment();
    allItems.forEach(item => {
      if (!usedItems.has(item)) fragment.appendChild(item);
    });
    col3.appendChild(fragment);
  }

  restartScrollAnimation();
  animateGalleryItems();
}

window.addEventListener('resize', () => {
  clearTimeout(window._resizeTimeout);
  window._resizeTimeout = setTimeout(() => {
    reorderGallery();
  }, 300);
});

document.addEventListener('DOMContentLoaded', () => {
  reorderGallery();
});
