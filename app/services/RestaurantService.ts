import { GOOGLE_PLACES_API_KEY } from '@env';
import { Location } from '../types/restaurant';

export const fetchRestaurantsInArea = async (lat: number, lng: number, radius: number) => {
  let allResults: any[] = [];
  let nextPageToken = null;
  const maxAttempts = 3;

  try {
    do {
      const pageParam: string = nextPageToken ? `&pagetoken=${nextPageToken}` : '';
      const response: Response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${lat},${lng}&` +
        `radius=${Math.min(50000, radius)}&` +
        `type=restaurant&` +
        `key=${GOOGLE_PLACES_API_KEY}${pageParam}`
      );
      
      const data = await response.json();
      
      if (data.results) {
        allResults = [...allResults, ...data.results];
        console.log(`Fetched ${data.results.length} restaurants`);
      }
      
      nextPageToken = data.next_page_token;
      
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (nextPageToken && allResults.length < 60);

    return allResults;
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
};

export const generateSearchGrid = (centerLat: number, centerLng: number, radius: number) => {
  const points = [];
  const gridSize = Math.ceil(radius / 35000);
  const latStep = (radius / 111320) / gridSize;
  const lngStep = (radius / (111320 * Math.cos(centerLat * (Math.PI / 180)))) / gridSize;

  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const lat = centerLat + (i * latStep);
      const lng = centerLng + (j * lngStep);
      
      const distance = calculateDistance(centerLat, centerLng, lat, lng);
      if (distance <= radius) {
        points.push({ lat, lng });
      }
    }
  }

  return points;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const getPhotoUrl = (photoReference: string) => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}; 