import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { IVehicle } from '@/types';
import { vehicleService } from '@/services/vehicleService';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid #2563EB;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.5a1 1 0 0 0-.8.4L2 11v5h1m2 0H2m0 0V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/><path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/><path d="M15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface KosovoMapProps {
  vehicles?: IVehicle[];
  height?: string;
  showAll?: boolean;
  filters?: any;
}

function MapUpdater({ filters }: { filters?: any }) {
  const map = useMap();
  useEffect(() => {
    if (filters?.center) {
      map.setView(filters.center, filters.zoom || 10);
    }
  }, [filters]);
  return null;
}

function MarkerCluster({ vehicles, onNavigate }: { vehicles: IVehicle[]; onNavigate: (id: string) => void }) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="background:#2563EB;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${count}</div>`,
          className: 'custom-marker-cluster',
          iconSize: L.point(40, 40),
        });
      },
    });

    vehicles
      .filter(v => v.coordinates?.lat && v.coordinates?.lng)
      .forEach((vehicle) => {
        const marker = L.marker([vehicle.coordinates.lat, vehicle.coordinates.lng], { icon: vehicleIcon });
        const popupContent = document.createElement('div');
        popupContent.className = 'vehicle-marker cursor-pointer';
        popupContent.innerHTML = `
          <div style="display:flex;gap:12px;">
            ${vehicle.images?.[0] ? `<img src="${vehicle.images[0]}" alt="${vehicle.title}" style="width:80px;height:64px;border-radius:8px;object-fit:cover;" />` : ''}
            <div style="flex:1;min-width:0;">
              <h4 style="font-weight:600;font-size:14px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${vehicle.title}</h4>
              <p style="color:#2563EB;font-weight:700;font-size:14px;margin:4px 0;">${formatPrice(vehicle.dailyPrice)}/ditë</p>
              <div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
                <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;background:${vehicle.availability ? '#D1FAE5' : '#FEF3C7'};color:${vehicle.availability ? '#065F46' : '#92400E'};">${vehicle.availability ? 'Në Disponim' : 'E Pa Disponueshme'}</span>
                <span style="font-size:10px;color:#94A3B8;text-transform:uppercase;">${vehicle.category}</span>
              </div>
            </div>
          </div>
        `;
        popupContent.addEventListener('click', () => onNavigate(vehicle._id));
        marker.bindPopup(popupContent, { maxWidth: 280, className: '' });
        mcg.addLayer(marker);
      });

    map.addLayer(mcg);
    clusterGroupRef.current = mcg;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map, vehicles]);

  return null;
}

export default function KosovoMap({ vehicles: propVehicles, height = '500px', showAll = true, filters }: KosovoMapProps) {
  const [vehicles, setVehicles] = useState<IVehicle[]>(propVehicles || []);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!propVehicles && showAll) {
      loadVehicles();
    }
  }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await vehicleService.getAll({ limit: 100 });
      setVehicles(data.data || data.vehicles || []);
    } catch {
      // ignore
    }
  };

  const allVehicles = propVehicles || vehicles;

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden shadow-soft-md">
      <MapContainer
        center={[42.6026, 20.9029]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater filters={filters} />
        <MarkerCluster vehicles={allVehicles} onNavigate={(id) => navigate(`/vehicles/${id}`)} />
      </MapContainer>
    </div>
  );
}
