// declare module 'leaflet' {
//   namespace control {
//     function ruler(options?);
//   }
// }

import * as L from 'leaflet';

declare module 'leaflet' {
  interface control {
    ruler(options?): Control.Ruler;
  }

  namespace control {
    interface Ruler {
      addTo(map: L.Map): this;
    }

    function ruler(options?): Ruler;
  }
}
