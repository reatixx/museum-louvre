import'./slider-photo.js';
import'./gallery.js';
import'./nav.js';
import '../scss/style.scss';
import './welcome-slider.js';
import { restartScrollAnimation, animateGalleryItems } from './gallery-scroll.js';
import './tickets.js'
import './map.js';
import './video-slider.js';
import { VideoPanel } from './video-panel.js';
import './validation-form.js';

const videoPanel = new VideoPanel('video');
videoPanel.init();