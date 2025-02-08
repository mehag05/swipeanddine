import { GOOGLE_PLACES_API_KEY } from '@env';
import { Location, Restaurant } from '../types/restaurant';

interface GooglePlace {
  place_id: string;
  name: string;
  types: string[];
  price_level?: number;
  rating?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

const isFoodPhoto = (photo: any) => {
  const attributions = photo.html_attributions || [];
  const tags = photo.tags || [];
  
  // Keywords that might indicate food photos
  const foodKeywords = ['food', 'dish', 'meal', 'menu', 'cuisine', 'plate', 'appetizer', 'dessert'];
  
  return attributions.some((attr: string) => 
    foodKeywords.some(keyword => attr.toLowerCase().includes(keyword))
  ) || tags.some((tag: string) =>
    foodKeywords.some(keyword => tag.toLowerCase().includes(keyword))
  );
};

export const processGooglePlace = async (place: GooglePlace): Promise<Restaurant> => {
  console.log('Processing place:', place.name);
  
  const details = await getPlaceDetails(place.place_id);
  console.log('Got details for', place.name, ':', 
    details ? `Found photo (${details.isFood ? 'food' : 'place'})` : 'No details');

  return {
    id: place.place_id,
    name: place.name,
    types: [...new Set([...(place.types || []), ...(details?.types || [])])],
    priceLevel: details?.price_level || place.price_level,
    rating: place.rating,
    photoUrl: details?.bestPhoto ? getPhotoUrl(details.bestPhoto) : null,
    photoIsFood: details?.isFood || false,
    vicinity: place.vicinity,
    location: place.geometry.location,
    rawTypes: place.types.filter(type => 
      type.includes('restaurant') || 
      type.includes('food') ||
      type.includes('cafe') ||
      type.includes('bar')
    )
  };
};

export const fetchRestaurantsInArea = async (lat: number, lng: number, radius: number) => {
  let allResults: Restaurant[] = [];
  let nextPageToken = null;
  const maxAttempts = 3;

  try {
    do {
      const pageParam = nextPageToken ? `&pagetoken=${nextPageToken}` : '';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${lat},${lng}&` +
        `radius=${Math.min(50000, radius)}&` +
        `type=restaurant&` +
        `key=${GOOGLE_PLACES_API_KEY}${pageParam}`
      );
      
      const data = await response.json();
      
      if (data.results) {
        // Process places sequentially to avoid rate limiting
        const processed = await Promise.all(
          data.results.map(place => processGooglePlace(place))
        );
        allResults = [...allResults, ...processed];
        console.log(`Processed ${processed.length} restaurants`);
        
        if (processed.length > 0) {
          console.log('Sample processed restaurant:', processed[0]);
        }
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
  return `https://maps.googleapis.com/maps/api/place/photo?` +
         `maxwidth=1200&` +
         `maxheight=1200&` +
         `photo_reference=${photoReference}&` +
         `key=${GOOGLE_PLACES_API_KEY}`;
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=photos,price_level,types&` +
      `key=${GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();
    if (!data.result) {
      console.log('No details found for place:', placeId);
      return null;
    }

    const photos = data.result.photos || [];
    
    // First try to find food photos
    const foodPhotos = photos.filter(isFoodPhoto);
    console.log(`Found ${foodPhotos.length} food photos out of ${photos.length} total`);

    // If we found food photos, use the first one
    if (foodPhotos.length > 0) {
      return {
        ...data.result,
        bestPhoto: foodPhotos[0].photo_reference,
        isFood: true
      };
    }

    // Otherwise, use the first exterior/interior photo
    return {
      ...data.result,
      bestPhoto: photos[0]?.photo_reference,
      isFood: false
    };

  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}; 