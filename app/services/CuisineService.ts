interface CuisineCategory {
  name: string;
  keywords: string[];
  googleTypes: string[];
}

class CuisineService {
  private categories: CuisineCategory[] = [
    {
      name: 'Italian',
      keywords: ['italian', 'pizza', 'pasta', 'risotto', 'trattoria', 'osteria', 'ristorante', 'pizzeria'],
      googleTypes: ['italian_restaurant', 'pizza_restaurant']
    },
    {
      name: 'Mexican',
      keywords: ['mexican', 'taco', 'burrito', 'enchilada', 'tortilla', 'taqueria', 'cantina', 'quesadilla', 'fajita'],
      googleTypes: ['mexican_restaurant', 'taco_restaurant']
    },
    {
      name: 'Chinese',
      keywords: ['chinese', 'dim sum', 'szechuan', 'sichuan', 'hunan', 'canton', 'wok', 'noodle', 'panda', 'dragon'],
      googleTypes: ['chinese_restaurant', 'asian_restaurant']
    },
    {
      name: 'Japanese',
      keywords: ['japanese', 'sushi', 'ramen', 'tempura', 'udon', 'izakaya', 'teriyaki', 'bento', 'tokyo'],
      googleTypes: ['japanese_restaurant', 'sushi_restaurant']
    },
    {
      name: 'Thai',
      keywords: ['thai', 'pad thai', 'curry', 'bangkok', 'basil', 'thailand'],
      googleTypes: ['thai_restaurant']
    },
    {
      name: 'Indian',
      keywords: ['indian', 'curry', 'tandoori', 'masala', 'biryani', 'tikka', 'punjabi', 'delhi', 'bombay'],
      googleTypes: ['indian_restaurant']
    },
    {
      name: 'American',
      keywords: ['american', 'burger', 'steak', 'bbq', 'grill', 'diner', 'wings', 'fries', 'hot dog', 'sandwich'],
      googleTypes: ['american_restaurant', 'burger_restaurant', 'steak_house', 'diner']
    },
    {
      name: 'Mediterranean',
      keywords: ['mediterranean', 'greek', 'turkish', 'hummus', 'falafel', 'kebab', 'shawarma', 'gyro', 'pita'],
      googleTypes: ['mediterranean_restaurant', 'greek_restaurant', 'turkish_restaurant', 'middle_eastern_restaurant']
    },
    {
      name: 'Vietnamese',
      keywords: ['vietnamese', 'pho', 'banh mi', 'spring roll', 'vietnam'],
      googleTypes: ['vietnamese_restaurant']
    },
    {
      name: 'Korean',
      keywords: ['korean', 'bibimbap', 'bulgogi', 'kimchi', 'seoul', 'korea', 'kbbq'],
      googleTypes: ['korean_restaurant']
    },
    {
      name: 'Fast Food',
      keywords: ['mcdonalds', 'burger king', 'wendys', 'fast food', 'drive-thru', 'drive thru', 'fries'],
      googleTypes: ['fast_food_restaurant', 'meal_takeaway']
    },
    {
      name: 'Seafood',
      keywords: ['seafood', 'fish', 'sushi', 'lobster', 'crab', 'shrimp', 'oyster'],
      googleTypes: ['seafood_restaurant']
    },
    {
      name: 'BBQ',
      keywords: ['bbq', 'barbecue', 'barbeque', 'smokehouse', 'smoked', 'grill'],
      googleTypes: ['bbq_restaurant']
    },
    {
      name: 'Breakfast',
      keywords: ['breakfast', 'brunch', 'pancake', 'waffle', 'diner', 'cafe', 'coffee'],
      googleTypes: ['breakfast_restaurant', 'cafe']
    },
    {
      name: 'Bar & Grill',
      keywords: ['bar', 'pub', 'tavern', 'sports bar', 'brewery', 'ale house'],
      googleTypes: ['bar', 'pub', 'sports_bar']
    },
    {
      name: 'Asian Fusion',
      keywords: ['fusion', 'asian fusion', 'pan asian', 'modern asian'],
      googleTypes: ['asian_fusion_restaurant', 'asian_restaurant']
    }
  ];

  categorizeRestaurant(restaurant: any): string {
    if (!restaurant.name || !restaurant.types) return 'Other';

    const details = {
      name: restaurant.name.toLowerCase(),
      types: restaurant.types.map((t: string) => t.toLowerCase()),
      vicinity: (restaurant.vicinity || '').toLowerCase()
    };

    // Debug log
    console.log(`Categorizing: ${restaurant.name}`);
    console.log(`Types: ${details.types.join(', ')}`);

    // First check Google's types
    for (const category of this.categories) {
      if (category.googleTypes.some(type => details.types.includes(type))) {
        console.log(`Matched by Google type: ${category.name}`);
        return category.name;
      }
    }

    // Then check keywords in name and vicinity
    const searchText = `${details.name} ${details.vicinity}`;
    for (const category of this.categories) {
      if (category.keywords.some(keyword => searchText.includes(keyword))) {
        console.log(`Matched by keyword: ${category.name}`);
        return category.name;
      }
    }

    // If it's a restaurant but no specific match, try partial matches
    if (details.types.includes('restaurant') || details.types.includes('food')) {
      for (const category of this.categories) {
        // Split restaurant name into words and check for partial matches
        const words = details.name.split(/\s+/);
        for (const word of words) {
          if (word.length > 3 && // Only check words longer than 3 letters
              category.keywords.some(keyword => 
                keyword.includes(word) || word.includes(keyword)
              )) {
            console.log(`Partial match: ${category.name}`);
            return category.name;
          }
        }
      }
    }

    console.log('No match found - Other');
    return 'Other';
  }

  categorizeBatch(restaurants: any[]): Map<string, string> {
    const cuisineMap = new Map<string, string>();
    let categoryCounts: {[key: string]: number} = {};
    
    restaurants.forEach(restaurant => {
      const cuisine = this.categorizeRestaurant(restaurant);
      cuisineMap.set(restaurant.place_id, cuisine);
      categoryCounts[cuisine] = (categoryCounts[cuisine] || 0) + 1;
    });

    // Log category distribution
    console.log('Category distribution:', categoryCounts);
    
    return cuisineMap;
  }

  getRandomCategories(count: number = 2): string[] {
    const availableCategories = this.categories.map(c => c.name);
    const shuffled = [...availableCategories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export default new CuisineService(); 