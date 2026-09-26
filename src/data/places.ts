export type PlaceType =
  | 'gym'
  | 'community-centre'
  | 'sports-facility'
  | 'park'
  | 'pool'
  | 'court'

export type Place = {
  id: string
  name: string
  type: PlaceType
  address: string
  lat: number
  lng: number
  neighborhood: string
  summary: string
}

export const UBC_CENTER = { lat: 49.2606, lng: -123.246 }

export const places: Place[] = [
  {
    id: 'wpgcc',
    name: 'West Point Grey Community Centre',
    type: 'community-centre',
    address: '4397 W 2nd Ave, Vancouver',
    lat: 49.2719,
    lng: -123.2034,
    neighborhood: 'West Point Grey',
    summary:
      'Fitness centre, gymnasium, pickleball, badminton, and older-adult friendly drop-in programs.',
  },
  {
    id: 'src',
    name: 'UBC Student Recreation Centre',
    type: 'gym',
    address: '6000 Student Union Blvd, UBC',
    lat: 49.2684,
    lng: -123.2486,
    neighborhood: 'UBC',
    summary: 'Gym, studios, and drop-in recreation close to campus core.',
  },
  {
    id: 'arc',
    name: 'UBC Activities & Recreation Centre (ARC)',
    type: 'gym',
    address: '6081 University Blvd, UBC',
    lat: 49.2666,
    lng: -123.2472,
    neighborhood: 'UBC',
    summary: 'Strength and cardio floor plus group-fitness studios.',
  },
  {
    id: 'rec-north',
    name: 'UBC Recreation Centre North',
    type: 'gym',
    address: '2585 Wesbrook Mall, UBC',
    lat: 49.2661,
    lng: -123.2441,
    neighborhood: 'UBC',
    summary: 'Large fitness centre, gymnasiums, and studio space.',
  },
  {
    id: 'aquatic',
    name: 'UBC Aquatic Centre',
    type: 'pool',
    address: '6121 University Blvd, UBC',
    lat: 49.2677,
    lng: -123.2428,
    neighborhood: 'UBC',
    summary: 'Indoor pool for lap swim, aqua fitness, and gentle water movement.',
  },
  {
    id: 'tennis',
    name: 'UBC Tennis Centre',
    type: 'court',
    address: '6160 Thunderbird Blvd, UBC',
    lat: 49.2579,
    lng: -123.2457,
    neighborhood: 'UBC',
    summary: 'Indoor and outdoor tennis courts; public booking available.',
  },
  {
    id: 'thunderbird',
    name: 'Thunderbird Park',
    type: 'sports-facility',
    address: 'Thunderbird Blvd, UBC',
    lat: 49.2568,
    lng: -123.2434,
    neighborhood: 'UBC',
    summary: 'Fields, track, and walking loops around campus sport facilities.',
  },
  {
    id: 'war-memorial',
    name: 'War Memorial Gymnasium',
    type: 'sports-facility',
    address: '6081 University Blvd, UBC',
    lat: 49.2663,
    lng: -123.2464,
    neighborhood: 'UBC',
    summary: 'Campus gymnasium used for court sports and recreation.',
  },
  {
    id: 'ubc-golf',
    name: 'University Golf Club',
    type: 'sports-facility',
    address: '5185 University Blvd, Vancouver',
    lat: 49.2547,
    lng: -123.2396,
    neighborhood: 'UBC',
    summary: '18-hole public course and walking-friendly fairway paths.',
  },
  {
    id: 'jericho',
    name: 'Jericho Beach Park',
    type: 'park',
    address: '3941 Point Grey Rd, Vancouver',
    lat: 49.2722,
    lng: -123.1978,
    neighborhood: 'West Point Grey',
    summary: 'Seawall walking, outdoor tennis, and open space for easy movement.',
  },
  {
    id: 'locarno',
    name: 'Locarno Beach',
    type: 'park',
    address: 'NW Marine Dr, Vancouver',
    lat: 49.2762,
    lng: -123.2068,
    neighborhood: 'West Point Grey',
    summary: 'Flat beachfront walking with benches and gentle grades.',
  },
  {
    id: 'spanish-banks',
    name: 'Spanish Banks Beach',
    type: 'park',
    address: 'NW Marine Dr, Vancouver',
    lat: 49.2774,
    lng: -123.2176,
    neighborhood: 'West Point Grey',
    summary: 'Long waterfront path for walking, cycling, and easy outdoor time.',
  },
  {
    id: 'pacific-spirit',
    name: 'Pacific Spirit Regional Park (16th Ave entrance)',
    type: 'park',
    address: '16th Ave & Camosun St, Vancouver',
    lat: 49.2562,
    lng: -123.2148,
    neighborhood: 'West Point Grey / UBC',
    summary: 'Forest trails with mixed difficulty; start on wider, flatter loops.',
  },
  {
    id: 'dunbar-cc',
    name: 'Dunbar Community Centre',
    type: 'community-centre',
    address: '4747 Dunbar St, Vancouver',
    lat: 49.2444,
    lng: -123.1852,
    neighborhood: 'Dunbar / nearby',
    summary: 'Fitness centre, gymnasium, and community sport drop-ins.',
  },
  {
    id: 'kerrisdale-cc',
    name: 'Kerrisdale Community Centre',
    type: 'community-centre',
    address: '5851 West Blvd, Vancouver',
    lat: 49.2339,
    lng: -123.1557,
    neighborhood: 'Kerrisdale / nearby',
    summary: 'Pool, fitness, and older-adult programs a short trip from Point Grey.',
  },
]
