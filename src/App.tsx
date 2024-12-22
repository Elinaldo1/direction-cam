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


  const center: LatLngTuple = [51.505, -0.09]
  
  const [azimuth, setAzimuth] = useState(45); // Angle in degrees


  const lineDestination = destination([51.505, -0.09], 1, azimuth, {units: 'kilometers'});
  const [ distancePoints, setDistancePoints] = useState(distance([51.505, -0.09], lineDestination, {units: 'kilometers'}));
  const raioDistance = circle([-0.09, 51.505], 1, {units: 'kilometers', properties: {foo: 'bar'}});

  const [line, setLine] = useState<LatLngTuple[]>([
    [51.505, -0.09], // Starting point
    lineDestination.geometry.coordinates as LatLngTuple,  // Endpoint (initial direction)
  ]);

  // Function to update the line based on azimuth
  const updateAzimuth = (newAzimuth: number) => {
    setAzimuth(newAzimuth);
    setDistancePoints(distance([51.505, -0.09], lineDestination, {units: 'meters'}))
    // const startPoint = line[0];
    // const distance = 0.01; // Adjust this value for the length of the line

    // // Calculate new endpoint based on azimuth (simple trig, assuming small distance)
    // const radians = (newAzimuth * Math.PI) / 180;
    // const endPoint: LatLngTuple = [
    //   startPoint[0] + distance * Math.cos(radians),
    //   startPoint[1] + distance * Math.sin(radians),
    // ];

    // setLine([startPoint, endPoint]);
    setLine([
      [51.505, -0.09], // Starting point
      lineDestination.geometry.coordinates as LatLngTuple,  // Endpoint (initial direction)
    ])
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
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup.
            <button onClick={() => console.log(raioDistance)} >teste</button>
          </Popup>  {/* The popup will open when you hover over the marker */}
          <Tooltip sticky >Dica de ferramenta</Tooltip>
        </Marker>
        <Marker position={lineDestination.geometry.coordinates as LatLngTuple}>
          <Popup>Criado com turf</Popup>  {/* The popup will open when you hover over the marker */}
          <Tooltip sticky permanent >{distancePoints}</Tooltip>
        </Marker>
        <Polyline positions={line} color="blue">
          <Tooltip sticky >
            line criado com turf
          </Tooltip>
        </Polyline>
        {/* <Circle center={center} radius={1000} /> */}
        <GeoJSON data={raioDistance} style={{}} />
        <LeafletRuler/>
      </MapContainer>
    </>
  )
}


export default App
