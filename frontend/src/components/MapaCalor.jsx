import { useEffect, useRef } from 'react';
import { dashboardService } from '../services/api';

export default function MapaCalor() {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const cargarMapa = async () => {
      // Cargar Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      await new Promise((res, rej) => {
        if (window.L) return res();
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onload = res; s.onerror = rej;
        document.body.appendChild(s);
      });

      if (mapInstanceRef.current || !mapRef.current) return;
      const L   = window.L;
      const map = L.map(mapRef.current).setView([4.6590, -74.0930], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB'
      }).addTo(map);
      mapInstanceRef.current = map;

      // Cargar datos
      try {
        const res    = await dashboardService.mapa();
        const puntos = res.data;

        const COLORES = {
          'Hurto / raponazo':       '#e05c3a',
          'Intento de hurto':       '#c9b878',
          'Caída en instalaciones': '#3ecfb5',
          'Caída en zona periférica':'#4f8ef7',
          'Agresión física':        '#f09080',
          'Amenaza verbal':         '#a78bfa',
          'Otro':                   '#94a3b8'
        };

        puntos.forEach(p => {
          if (!p.latitud || !p.longitud) return;
          const color = COLORES[p.tipo_incidente] || '#94a3b8';

          // Círculo pulsante
          L.circleMarker([p.latitud, p.longitud], {
            radius: 10, fillColor: color, color: color,
            weight: 2, opacity: 0.9, fillOpacity: 0.5
          })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:200px">
              <div style="font-weight:700;margin-bottom:6px;color:#1a1a2e">${p.tipo_incidente}</div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">📅 ${new Date(p.fecha_ocurrencia).toLocaleDateString('es-CO')}</div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">📍 ${p.direccion_manual || 'Sin dirección'}</div>
              <div style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${color}22;color:${color};border:1px solid ${color}44">${p.estado}</div>
            </div>
          `)
          .addTo(map);
        });

        // Leyenda
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
          const div = L.DomUtil.create('div');
          div.style.cssText = 'background:rgba(8,12,31,0.95);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);font-family:sans-serif';
          div.innerHTML = `
            <div style="font-weight:700;color:#c9b878;font-size:12px;margin-bottom:8px;letter-spacing:.5px">TIPOS</div>
            ${Object.entries(COLORES).map(([tipo, color]) =>
              `<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px">
                <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
                <span style="font-size:11px;color:rgba(240,232,210,0.7)">${tipo}</span>
              </div>`
            ).join('')}
          `;
          return div;
        };
        legend.addTo(map);
      } catch (e) {
        console.error('Error cargando mapa:', e);
      }
    };

    cargarMapa();
  }, []);

  return (
    <div className="page-bg">
      <div className="dashboard">
        <h2>🗺️ Mapa de Incidentes</h2>
        <div className="dash-live">
          <div className="live-dot"></div>
          Incidentes con geolocalización — Bogotá
        </div>

        <div style={{
          height: '520px', borderRadius: '18px',
          border: '1px solid var(--rim)', overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>

        <div className="seccion" style={{ fontSize: '13px', color: 'rgba(240,232,210,0.5)' }}>
          <h3>Cómo leer el mapa</h3>
          <p style={{ fontWeight: 300, lineHeight: 1.7 }}>
            Cada punto representa un incidente reportado con geolocalización GPS. 
            El color indica el tipo de incidente. Haz clic en cualquier punto para 
            ver los detalles completos del caso.
          </p>
        </div>
      </div>
    </div>
  );
}
