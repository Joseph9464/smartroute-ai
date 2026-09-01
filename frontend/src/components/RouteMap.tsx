import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Depot Icon
const depotIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2942/2942940.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface RoutePoint {
  customer_id: number;
  latitude: number;
  longitude: number;
  demand: number;
  arrival_time: number;
}

interface VehicleRoute {
  vehicle_id: number;
  route: RoutePoint[];
  total_distance: number;
  total_time: number;
  total_demand: number;
}

interface Props {
  routes: VehicleRoute[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export const RouteMap: React.FC<Props> = ({ routes }) => {
  const [activeRoute, setActiveRoute] = useState<number | null>(null);

  if (!routes || routes.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-lg">
        <p className="text-slate-500">No routes to display. Run optimization first.</p>
      </div>
    );
  }

  const firstRoute = routes[0]?.route;
  const center: [number, number] = firstRoute && firstRoute.length > 0 
    ? [firstRoute[0].latitude, firstRoute[0].longitude] 
    : [40.75, -73.98];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <div className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-lg shadow-md border border-slate-200">
        <p className="text-xs text-slate-500 italic mb-2">Road geometry unavailable — displaying simplified route.</p>
        <h4 className="font-bold text-sm mb-2">Route Legend</h4>
        <div className="space-y-1">
          {routes.map((r, i) => (
            <div 
              key={r.vehicle_id} 
              className={`flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 ${activeRoute === r.vehicle_id ? 'bg-slate-100 font-bold' : ''}`}
              onClick={() => setActiveRoute(activeRoute === r.vehicle_id ? null : r.vehicle_id)}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
              <span className="text-sm">Vehicle {r.vehicle_id + 1}</span>
            </div>
          ))}
          {activeRoute !== null && (
            <button onClick={() => setActiveRoute(null)} className="text-xs text-blue-600 mt-2 hover:underline">Show All</button>
          )}
        </div>
      </div>

      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        
        {routes.map((route, idx) => {
          const isFaded = activeRoute !== null && activeRoute !== route.vehicle_id;
          const color = COLORS[idx % COLORS.length];
          const positions = route.route.map(pt => [pt.latitude, pt.longitude] as [number, number]);
          
          return (
            <React.Fragment key={route.vehicle_id}>
              <Polyline 
                positions={positions} 
                pathOptions={{ color, weight: isFaded ? 2 : 5, opacity: isFaded ? 0.3 : 0.8 }} 
                eventHandlers={{ click: () => setActiveRoute(route.vehicle_id) }}
              />
              {route.route.map((pt, pIdx) => {
                const isDepot = pt.customer_id === 0;
                // Only show depot marker once to avoid overlap, let's tie it to vehicle 0
                if (isDepot && route.vehicle_id !== routes[0].vehicle_id && activeRoute === null) return null;
                
                return (
                  <Marker 
                    key={`${route.vehicle_id}-${pIdx}`} 
                    position={[pt.latitude, pt.longitude]}
                    icon={isDepot ? depotIcon : new L.Icon.Default()}
                    opacity={isFaded ? 0.4 : 1}
                  >
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-sm mb-1">{isDepot ? "🏭 Main Depot" : `Customer #${pt.customer_id}`}</p>
                        <div className="text-xs space-y-1 text-slate-600">
                          <p><strong>Vehicle:</strong> {route.vehicle_id + 1}</p>
                          <p><strong>Stop Number:</strong> {pIdx + 1}</p>
                          {!isDepot && <p><strong>Demand:</strong> {pt.demand} units</p>}
                          <p><strong>Est. Arrival:</strong> {pt.arrival_time.toFixed(1)} mins</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
