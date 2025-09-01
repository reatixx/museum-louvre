const container = document.querySelector('[data-container]');
const imageBefore = container.querySelector('[data-image1]');
const imageAfter = container.querySelector('[data-image2]');
const button = container.querySelector('[data-button]');

let containerRect = container.getBoundingClientRect();

const updateContainerRect = () => {
  containerRect = container.getBoundingClientRect();
};

const handleDown = (e) => {
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('mouseup', handleMouseUp);
  updateContainerRect();
};

const handleDrag = (e) => {
  let buttonPos = e.clientX - containerRect.left;
  
  buttonPos = Math.max(0, Math.min(buttonPos, containerRect.width));
  
  const percent = (buttonPos / containerRect.width) * 100;
  
  button.style.left = `${percent}%`;
  imageBefore.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
  imageAfter.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
};

const handleMouseUp = () => {
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('mouseup', handleMouseUp);
};

window.addEventListener('resize', updateContainerRect);

if (button) {
  button.addEventListener('mousedown', handleDown);
  
  const initialPercent = 61;
  button.style.left = `${initialPercent}%`;
  imageBefore.style.clipPath = `polygon(0 0, ${initialPercent}% 0, ${initialPercent}% 100%, 0 100%)`;
  imageAfter.style.clipPath = `polygon(${initialPercent}% 0, 100% 0, 100% 100%, ${initialPercent}% 100%)`;
}