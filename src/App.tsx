import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MouseEvent, useRef, useState } from 'react';
import { GeoJSON, LayerGroup, LayersControl, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import './App.css';


import { circle } from '@turf/circle';
import { destination } from '@turf/destination';
import { distance } from '@turf/distance';
import LeafletRuler from './LeafletRuler';


const { BaseLayer, Overlay } = LayersControl;

function App() {

  const center: LatLngTuple = [51.505, -0.09];

  const [azimuth, setAzimuth] = useState(45); // Angle in degrees

  // Corrigir ordem das coordenadas para Turf.js: [longitude, latitude]
  const turfCenter: [number, number] = [center[1], center[0]];

  // Calcular destino corretamente (1km do centro em qualquer direção)
  const lineDestination = destination(turfCenter, 1, azimuth, {units: 'kilometers'});

  // Calcular distância do centro ao destino (deve ser sempre 1km)
  const [distancePoints, setDistancePoints] = useState(
    distance(turfCenter, lineDestination.geometry.coordinates, {units: 'kilometers'})
  );

  // Círculo de 1km de raio (não diâmetro) - Turf espera [longitude, latitude]
  const raioDistance = circle(turfCenter, 1, {units: 'kilometers', properties: {foo: 'bar'}});

  // Corrigir linha: converter destino para [latitude, longitude] para Leaflet
  const [line, setLine] = useState<LatLngTuple[]>([
    center, // ponto inicial
    [lineDestination.geometry.coordinates[1], lineDestination.geometry.coordinates[0]], // ponto final convertido
  ]);

  // Função para atualizar azimute e recalcular linha e distância
  const updateAzimuth = (newAzimuth: number) => {
    setAzimuth(newAzimuth);
    // Recalcular destino e linha
    const newDestination = destination(turfCenter, 1, newAzimuth, {units: 'kilometers'});
    setDistancePoints(
      distance(turfCenter, newDestination.geometry.coordinates, {units: 'kilometers'})
    );
    setLine([
      center,
      [newDestination.geometry.coordinates[1], newDestination.geometry.coordinates[0]],
    ]);
  };


  const [menuOpen, setMenuOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 10 });

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  

  // Dragging functions
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    if (overlayRef.current) {
      overlayRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (dragging && overlayRef.current) {
      const newX = e.clientX - overlayRef.current.offsetWidth / 2;
      const newY = e.clientY - overlayRef.current.offsetHeight / 2;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    if (overlayRef.current) {
      overlayRef.current.style.cursor = 'grab';
    }
  };

  return (
    <>
      <div style={{ position: 'absolute', top: 20, left: 50, zIndex: 1000, backgroundColor: 'black' }}>
        <label>Azimuth: {azimuth}°</label>
        <input
          type="range"
          min="0"
          max="360"
          value={azimuth}
          onChange={(e) => updateAzimuth(parseInt(e.target.value))}
        />
      </div>
      {/* Button to toggle the menu */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
        }}
      >
        <button onClick={toggleMenu}>
          {menuOpen ? 'Fechar Menu' : 'Abrir Menu'}
        </button>
      </div>
      {
        menuOpen &&
        <div
          ref={overlayRef}
          className="overlay-container"
          style={{ 
            top: `${position.y}px`, 
            left: `${position.x}px`, 
            position: 'absolute' 
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}  //Para garantir que o drag termine ao sair da div 
        >
          <h1>MAPA LEAFLET</h1>
          <button onClick={() => console.log(lineDestination)} >Control Button</button>
        </div>
      }
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{height: '100vh', width: '100wh'}}
        
      >
        <LayersControl position="topleft" sortLayers>
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="OpenStreetMap DE">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          </BaseLayer>
          <Overlay name="Overlay">
            <LayerGroup>

            </LayerGroup>
          </Overlay>
        </LayersControl>
        <Marker position={center}>
          <Popup>
            A pretty CSS3 popup.
            <button onClick={() => console.log(raioDistance)} >teste</button>
            <div style={{ position: 'absolute', zIndex: 1000}}>
              <label>Azimuth: {azimuth}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={azimuth}
                onChange={(e) => updateAzimuth(parseInt(e.target.value))}
              />
            </div>
          </Popup>
          <Tooltip sticky >Dica de ferramenta</Tooltip>
        </Marker>
        {/* <Marker position={[lineDestination.geometry.coordinates[1], lineDestination.geometry.coordinates[0]]}>
          <Popup>Criado com turf</Popup>
          <Tooltip sticky permanent >{distancePoints}</Tooltip>
        </Marker> */}
        <Polyline positions={line} color="blue">
          <Tooltip sticky >
            line criado com turf
          </Tooltip>
        </Polyline>
        <GeoJSON data={raioDistance} style={{}} />
        <LeafletRuler/>
      </MapContainer>
    </>
  )
}


export default App
