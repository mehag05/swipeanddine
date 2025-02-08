import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { GOOGLE_PLACES_API_KEY } from '@env';
import CuisineService from '../services/CuisineService';
import OpenAIService from '../services/OpenAIService';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { Results } from './Results';
import { router } from 'expo-router';
const { width } = Dimensions.get('window');

interface Restaurant {
  name: string;
  types: string[];
  photos?: { photo_reference: string }[];
  vicinity: string;
  location_id: string;
  address: string;
  cuisineCategory?: string;
  distance: number;
  rating?: number;
  price_level?: number;
  place_id: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface CuisineMatch {
  option1: string;
  option2: string;
}

export default function RestaurantTest() {
  const [gameStage, setGameStage] = useState<'start' | 'cuisine' | 'restaurant' | 'budget' | 'results'>('budget');
  const [cuisineChoices, setCuisineChoices] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(1500); // Default 1.5km (~1 mile)
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [currentMatch, setCurrentMatch] = useState<CuisineMatch | null>(null);
  const [winningCuisines, setWinningCuisines] = useState<string[]>([]);
  const [tournamentRound, setTournamentRound] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);

  const handleBack = () => {
    router.back();
  };


  useEffect(() => {
    getUserLocation();
  }, []);
  

  const getUserLocation = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('Current location:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Could not get your location');
    }
  };

  const generateSearchGrid = (centerLat: number, centerLng: number, radius: number) => {
    const points = [];
    const gridSize = Math.ceil(radius / 35000); // 35km to ensure overlap
    const latStep = (radius / 111320) / gridSize; // Convert meters to degrees
    const lngStep = (radius / (111320 * Math.cos(centerLat * (Math.PI / 180)))) / gridSize;

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const lat = centerLat + (i * latStep);
        const lng = centerLng + (j * lngStep);
        
        // Check if this point is within our search radius
        const distance = calculateDistance(centerLat, centerLng, lat, lng);
        if (distance <= radius) {
          points.push({ lat, lng });
        }
      }
    }

    console.log(`Generated ${points.length} search points in grid`);
    return points;
  };

  const fetchRestaurantsInArea = async (lat: number, lng: number, radius: number) => {
    let allResults: any[] = [];
    let nextPageToken = null;
    const maxAttempts = 3; // Get up to 3 pages

    try {
      do {
        const pageParam: string = nextPageToken ? `&pagetoken=${nextPageToken}` : '';
        const response: any = await fetch(
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
          // Google requires a delay between pagination requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } while (nextPageToken && allResults.length < 60);

      return allResults;
    } catch (error) {
      console.error('Fetch Error:', error);
      return [];
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    try {
      if (!userLocation) {
        setLocationError('Location not available');
        return;
      }

      const centerLat = userLocation.coords.latitude;
      const centerLng = userLocation.coords.longitude;
      
      // Generate grid of search points
      const searchPoints = generateSearchGrid(centerLat, centerLng, searchRadius);
      
      // Fetch from all points
      let allResults: any = [];
      const seenPlaceIds = new Set();
      
      setLoadingStatus(`Searching ${searchPoints.length} areas for restaurants...`);
      
      for (let i = 0; i < searchPoints.length; i++) {
        const point = searchPoints[i];
        setLoadingStatus(`Searching area ${i + 1} of ${searchPoints.length}...`);
        
        const results = await fetchRestaurantsInArea(point.lat, point.lng, searchRadius);
        
        // Log raw results
        console.log(`Area ${i + 1} found ${results.length} restaurants`);
        results.forEach(r => {
          console.log(`Restaurant: ${r.name}, Types: ${r.types?.join(', ')}`);
        });

        // Deduplicate results using place_id
        results.forEach(restaurant => {
          if (!seenPlaceIds.has(restaurant.place_id)) {
            seenPlaceIds.add(restaurant.place_id);
            allResults.push(restaurant);
          }
        });
      }

      console.log('Total unique restaurants:', allResults.length);

      // Filter restaurants by price level if set
      const priceFilteredResults = priceLevel 
        ? allResults.filter((r: Restaurant) => r.price_level === priceLevel)
        : allResults;
      
      // Use CuisineService for categorization
      setLoadingStatus('Categorizing restaurants...');
      const cuisineMap = CuisineService.categorizeBatch(priceFilteredResults);

      // Log cuisine distribution
      const cuisineDistribution: { [key: string]: number } = {};
      cuisineMap.forEach((cuisine, placeId) => {
        cuisineDistribution[cuisine] = (cuisineDistribution[cuisine] || 0) + 1;
      });
      console.log('Cuisine Distribution:', cuisineDistribution);

      // Store categorized restaurants
      const categorizedRestaurants = priceFilteredResults.map((restaurant: Restaurant) => {
        const cuisine = cuisineMap.get(restaurant.place_id);
        console.log(`Categorized ${restaurant.name} as ${cuisine}`);
        return {
          ...restaurant,
          cuisineCategory: cuisine
        };
      });
      // Filter out 'Other' category
      const validRestaurants = categorizedRestaurants.filter((r: Restaurant) => r.cuisineCategory !== 'Other');
      console.log('Valid restaurants after filtering:', validRestaurants.length);

      // Get unique cuisines
      const uniqueCuisines = Array.from(new Set(validRestaurants.map((r: Restaurant) => r.cuisineCategory)))
        .filter(Boolean);
      console.log('Final unique cuisines:', uniqueCuisines);

      if (uniqueCuisines.length >= 2) {
        setRestaurants(validRestaurants);
        setAvailableCuisines(uniqueCuisines as string[]);
        setWinningCuisines(uniqueCuisines as string[]);
        setCurrentMatch({
          option1: uniqueCuisines[0] as string,
          option2: uniqueCuisines[1] as string
        });
        setGameStage('cuisine');
        setTournamentRound(1);
      } else {
        setLocationError('Not enough variety of restaurants found. Try increasing the search radius.');
      }

    } catch (error) {
      console.error('Error in startGame:', error);
      setLocationError('Error fetching restaurants');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const startNewRound = (cuisines: string[]) => {
    if (cuisines.length <= 1) {
      // Tournament is complete, move to restaurant selection
      setSelectedCuisine(cuisines[0]);
      setGameStage('restaurant');
      return;
    }

    // Get next pair of cuisines
    const shuffled = [...cuisines].sort(() => 0.5 - Math.random());
    setCurrentMatch({
      option1: shuffled[0],
      option2: shuffled[1]
    });
    setTournamentRound(prev => prev + 1);
  };

  const selectWinner = (winner: string) => {
    const updatedWinners = winningCuisines.filter(c => 
      c === winner || (c !== currentMatch?.option1 && c !== currentMatch?.option2)
    );
    setWinningCuisines(updatedWinners);

    if (updatedWinners.length <= 1) {
      // Tournament complete - show restaurants of winning cuisine
      const winningRestaurants = restaurants.filter((r: any) => r.cuisineCategory === winner);
      setFilteredRestaurants(winningRestaurants);
      setCurrentRestaurantIndex(0);
      setGameStage('restaurant');
    } else {
      startNewRound(updatedWinners);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const selectCuisine = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    const matchingRestaurants = restaurants.filter((r: any) => r.cuisineCategory === cuisine);
    setRestaurants(matchingRestaurants);
    setCurrentRestaurantIndex(0);
    setGameStage('restaurant');
  };

  const getPhotoUrl = (photoReference: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  };

  const currentRestaurant = restaurants[currentRestaurantIndex];

  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34; // Convert meters to miles
    return `${miles.toFixed(1)} miles`;
  };

  const handleLike = (restaurant: Restaurant) => {
    setLikedRestaurants(prev => [...prev, restaurant]);
    setCurrentRestaurantIndex(i => i + 1);
  };

  const renderStartScreen = () => (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Restaurant Finder</Text>
      
      {locationError ? (
        <Text style={styles.errorText}>{locationError}</Text>
      ) : !userLocation ? (
        <Text>Getting your location...</Text>
      ) : (
        <Text style={styles.locationText}>
          We'll find the restaurants around you.
        </Text>
      )}
      
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>
          Search Radius: {formatDistance(searchRadius)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={800}      // 0.5 miles
          maximumValue={50000}    // About 31 miles (max Google Places radius)
          value={searchRadius}
          onValueChange={setSearchRadius}
          disabled={isLoading}
          minimumTrackTintColor="#DA291C"
          maximumTrackTintColor="#F3D677"
          step={1609}  // 1 mile increments
        />
        <View style={styles.sliderLabels}>
          <Text>0.5 mi</Text>
          <Text>31 mi</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loadingStatus || 'Loading...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take a minute while we analyze all restaurants in your area
          </Text>
        </View>
      ) : (
        <Button 
          title="Find Restaurants" 
          onPress={startGame}
          disabled={!userLocation || !!locationError}
        />
      )}
    </View>
  );

  const renderBudgetSelection = () => (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.question}>What's your budget?</Text>
      <View style={styles.budgetContainer}>
        <TouchableOpacity 
          style={[styles.budgetOption, priceLevel === 1 && styles.selectedBudget]}
          onPress={() => {
            setPriceLevel(1);
            setGameStage('start');  // Go to radius selection screen
          }}
        >
          <Text style={styles.budgetText}>$</Text>
          <Text style={styles.budgetDescription}>Inexpensive</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.budgetOption, priceLevel === 2 && styles.selectedBudget]}
          onPress={() => {
            setPriceLevel(2);
            setGameStage('start');  // Go to radius selection screen
          }}
        >
          <Text style={styles.budgetText}>$$</Text>
          <Text style={styles.budgetDescription}>Moderate</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.budgetOption, priceLevel === 3 && styles.selectedBudget]}
          onPress={() => {
            setPriceLevel(3);
            setGameStage('start');  // Go to radius selection screen
          }}
        >
          <Text style={styles.budgetText}>$$$</Text>
          <Text style={styles.budgetDescription}>Expensive</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.budgetOption, priceLevel === 4 && styles.selectedBudget]}
          onPress={() => {
            setPriceLevel(4);
            setGameStage('start');  // Go to radius selection screen
          }}
        >
          <Text style={styles.budgetText}>$$$$</Text>
          <Text style={styles.budgetDescription}>Very Expensive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCuisineChoice = () => (
    <View style={styles.container}>
      {currentMatch && (
        <>
          <Text style={styles.question}>Which cuisine do you prefer?</Text>
          <Text style={styles.roundInfo}>Round {tournamentRound}</Text>
          <View style={styles.matchupContainer}>
            <TouchableOpacity style={styles.cuisineOption1} onPress={() => selectWinner(currentMatch.option1)}>
              <Text style={styles.optionBtn}>{currentMatch.option1}</Text>
            </TouchableOpacity>
            <Text style={styles.vsText}>VS</Text>
            <TouchableOpacity style={styles.cuisineOption2} onPress={() => selectWinner(currentMatch.option2)}>
              <Text style={styles.optionBtn}>{currentMatch.option2}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.remainingInfo}>
            {winningCuisines.length} cuisines remaining
          </Text>
        </>
      )}
    </View>
  );

  const renderRestaurantList = () => (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image 
          source={require('../assets/images/icon.png')}  // Add your app logo
          style={styles.logo} 
        />
      </View>
      
      {filteredRestaurants.length > 0 && currentRestaurantIndex < filteredRestaurants.length ? (
        <View style={styles.card}>
          {filteredRestaurants[currentRestaurantIndex].photos?.[0]?.photo_reference ? (
            <Image
              source={{
                uri: getPhotoUrl(filteredRestaurants[currentRestaurantIndex].photos[0].photo_reference)
              }}
              style={styles.restaurantImage}
            />
          ) : (
            <View style={[styles.restaurantImage, { backgroundColor: '#f0f0f0' }]} />
          )}
          
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>
              {filteredRestaurants[currentRestaurantIndex].name}
            </Text>
            
            <View style={styles.cuisineTag}>
              <Text style={styles.cuisineText}>
                {filteredRestaurants[currentRestaurantIndex].cuisineCategory}
              </Text>
            </View>

            <Text style={styles.restaurantAddress}>
              {filteredRestaurants[currentRestaurantIndex].vicinity}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.skipButton]}
              onPress={() => setCurrentRestaurantIndex(i => i + 1)}
            >
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => handleLike(filteredRestaurants[currentRestaurantIndex])}
            >
              <Text style={styles.buttonText}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Results 
          likedRestaurants ={likedRestaurants as any[]} 
          onRestart={() => {
            setGameStage('budget');
            setLikedRestaurants([]);
            setCurrentRestaurantIndex(0);
          }} 
        />
      )}
    </View>
  );

  switch (gameStage) {
    case 'start':
      return renderStartScreen();
    case 'budget':
      return renderBudgetSelection();
    case 'cuisine':
      return renderCuisineChoice();
    case 'restaurant':
      return renderRestaurantList();
    case 'results':
      return <Results 
        likedRestaurants={likedRestaurants as any[]} 
        onRestart={() => {
          setGameStage('budget');
          setLikedRestaurants([]);
          setCurrentRestaurantIndex(0);
        }} 
      />;
    default:
      return null;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4', // Soft background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  choicesContainer: {
    width: '100%',
    gap: 10,
  },
  card: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',  // Full screen image
    resizeMode: 'cover',
  },
  restaurantInfo: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',  // Semi-transparent overlay
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  restaurantAddress: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  cuisineTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  cuisineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rating: {
    fontSize: 16,
    color: '#FFB900',
    marginBottom: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 24,
  },
  matchupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  cuisineOption1: {
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center', // Ensure text is centered
    flexDirection: 'row',  // Ensures text and icon (if any) are centered horizontally
    minHeight: 100,  
    backgroundColor: '#FF959F', // Soft yellow for option 1
  },

  // Option 2 button style, extending the baseCuisineOption style
  cuisineOption2: {
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center', // Ensure text is centered
    flexDirection: 'row',  // Ensures text and icon (if any) are centered horizontally
    minHeight: 100,  
    backgroundColor: '#EA4080', // Red for option 2
  },

  // Text style for the options inside the buttons
  optionBtn: {
    fontSize: 18,  // Default font size for readability
    fontWeight: 'bold',
    color: 'white',  // White text to contrast with the background
    textAlign: 'center',  // Ensure the text is centered
    paddingHorizontal: 10,  // Add horizontal padding for better spacing
    flexWrap: 'wrap', // Allow text to wrap if it's too long
    flex: 1, // Allow the text to adapt within the container width
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    margin: 10
  },

  roundInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  remainingInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
  },
  radiusContainer: {
    width: '90%', // Adjusted width for better proportion
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff', // Added background for contrast
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  radiusLabel: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333', // Darker label color for readability
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 15,
    borderRadius: 10, // Smooth slider
  },
  sliderTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd', // Light track background
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3D677', // Thumb color for contrast
  },
  sliderLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    color: '#333',
  },
  endMessage: {
    alignItems: 'center',
    marginTop: 20,
  },
  noResults: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  locationText: {
    marginVertical: 10,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    height: 30,
    width: 30,
    tintColor: '#FF6B6B',
  },
  budgetContainer: {
    padding: 20,
    gap: 15,
  },
  budgetOption: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 40,
    paddingRight: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedBudget: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  budgetText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  budgetDescription: {
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#000',
  },
});
