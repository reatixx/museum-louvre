let mapboxgl;

const louvreCoords = [2.3364, 48.86091];
const center768_1024 = [2.33798, 48.86142];

const tunnelDesTuileriesCoords = [2.33328, 48.8600];
const arcDeTriompheDuCarrouselCoords = [2.33294, 48.86178];
const rueDeRivoliCoords = [2.33640, 48.86254];
const sarcophageAbouRoachCoords = [2.33970, 48.86074];

let map;

async function loadMapbox() {
  if (!mapboxgl) {
    mapboxgl = (await import('mapbox-gl')).default;
    await import('mapbox-gl/dist/mapbox-gl.css');

    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxtM3R0ZSIsImEiOiJjbWUxb2Q4cTQwYzhtMmtzanJvdDJzYWliIn0.YTVzWvVFlpoa-OdQOw6YXQ';

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11',
      center: louvreCoords,
      zoom: 16
    });

    new mapboxgl.Marker({ color: 'black' })
      .setLngLat(louvreCoords)
      .setPopup(new mapboxgl.Popup().setText('Напротив Лувра'))
      .addTo(map);

    function addGrayMarker(lngLat, popupText) {
      new mapboxgl.Marker({ color: 'gray' })
        .setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup().setText(popupText))
        .addTo(map);
    }

    addGrayMarker(tunnelDesTuileriesCoords, 'Tunnel des Tuileries');
    addGrayMarker(arcDeTriompheDuCarrouselCoords, 'Arc de Triomphe du Carrousel');
    addGrayMarker(rueDeRivoliCoords, 'Rue de Rivoli');
    addGrayMarker(sarcophageAbouRoachCoords, 'Sarcophage d\'Abou Roach');

    function updateMapCenter() {
      const width = window.innerWidth;
      if (width === 768 || width === 1024) {
        map.setCenter(center768_1024);
      } else {
        map.setCenter(louvreCoords);
      }
    }

    updateMapCenter();
    window.addEventListener('resize', updateMapCenter);
  }
}

loadMapbox();
