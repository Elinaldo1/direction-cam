import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "./leaflet-ruler.css";
import "./leaflet-ruler";

export default function LeafletRuler() {
    const map = useMap();

    const rulerControlRef = useRef<any>(null); // Usando um ref para manter controle do L.control.ruler()


    useEffect(() => {
        if (!map) return;
    
        // Adiciona o controle de régua apenas uma vez
        if (!rulerControlRef.current) {
          rulerControlRef.current = L.control.ruler().addTo(map);
        }
    
        // Limpa o controle ao desmontar o componente para evitar duplicatas
        return () => {
          if (rulerControlRef.current) {
            map.removeControl(rulerControlRef.current);
            rulerControlRef.current = null; // Garantir que o controle seja removido
          }
        };
      }, [map]);
  
    // useEffect(() => {
    //   if (!map) return;
  
    //   L.control.ruler().addTo(map);
    // }, [map]);


  
    return null;
  }