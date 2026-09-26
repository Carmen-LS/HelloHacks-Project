import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Layout } from '../components/Layout'
import { places, type Place, type PlaceType, UBC_CENTER } from '../data/places'

const typeLabels: Record<PlaceType, string> = {
  gym: 'Gym',
  'community-centre': 'Community centre',
  'sports-facility': 'Sports facility',
  park: 'Park / outdoors',
  pool: 'Pool',
  court: 'Courts',
}

const typeFilters: Array<PlaceType | 'all'> = [
  'all',
  'gym',
  'community-centre',
  'sports-facility',
  'park',
  'pool',
  'court',
]

export function MapPage() {
  const [params] = useSearchParams()
  const focusId = params.get('place')
  const [type, setType] = useState<PlaceType | 'all'>('all')
  const [selected, setSelected] = useState<Place | null>(
    () => places.find((place) => place.id === focusId) ?? places[0],
  )
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  const visible = useMemo(
    () => places.filter((place) => type === 'all' || place.type === type),
    [type],
  )

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return

    const map = L.map(mapEl.current).setView([UBC_CENTER.lat, UBC_CENTER.lng], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const group = markersRef.current
    const map = mapRef.current
    if (!group || !map) return

    group.clearLayers()
    visible.forEach((place) => {
      const marker = L.circleMarker([place.lat, place.lng], {
        radius: place.id === selected?.id ? 12 : 8,
        color: '#1f4d3a',
        fillColor: place.id === selected?.id ? '#e2b04a' : '#3f7d64',
        fillOpacity: 0.95,
        weight: 2,
      }).bindPopup(`<strong>${place.name}</strong><br/>${place.address}`)
      marker.on('click', () => setSelected(place))
      group.addLayer(marker)
    })

    const focus = visible.find((place) => place.id === (selected?.id ?? focusId)) ?? visible[0]
    if (focus) {
      map.setView([focus.lat, focus.lng], 14)
    }
  }, [visible, selected, focusId])

  return (
    <Layout>
      <section className="page-intro">
        <div><p className="eyebrow">Find welcoming places around you</p><h1>Nearby facilities</h1><p>
          Seeded from public UBC and West Point Grey locations. Pins are approximate, for a
          hackathon prototype.
        </p></div>
      </section>

      <label className="filter-inline">
        Show
        <select value={type} onChange={(event) => setType(event.target.value as PlaceType | 'all')}>
          {typeFilters.map((value) => (
            <option key={value} value={value}>
              {value === 'all' ? 'All places' : typeLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <div className="map-layout">
        <div ref={mapEl} className="map" role="application" aria-label="Map of nearby facilities" />
        <aside className="place-list">
          {visible.map((place) => (
            <button
              key={place.id}
              type="button"
              className={place.id === selected?.id ? 'place-item active' : 'place-item'}
              onClick={() => setSelected(place)}
            >
              <strong>{place.name}</strong>
              <span>{typeLabels[place.type]}</span>
              <span>{place.address}</span>
              <span>{place.summary}</span>
            </button>
          ))}
        </aside>
      </div>
    </Layout>
  )
}
