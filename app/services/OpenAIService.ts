import OpenAI from 'openai';

class OpenAIService {
  private openai: OpenAI;
  private cuisineTypes = [
    // Asian Cuisines
    'Chinese', 'Japanese', 'Thai', 'Vietnamese', 'Korean', 'Indian', 'Sushi', 'Ramen', 
    'Dim Sum', 'Asian Fusion',
    
    // European Cuisines
    'Italian', 'French', 'Mediterranean', 'Greek', 'Spanish', 'German', 'British', 
    'Pizza', 'European',
    
    // American Cuisines
    'American', 'Southern', 'Tex-Mex', 'Cajun', 'Soul Food', 'BBQ', 'Steakhouse', 
    'Burgers', 'Hot Dogs',
    
    // Latin American Cuisines
    'Mexican', 'Brazilian', 'Peruvian', 'Cuban', 'Caribbean', 'Latin American',
    
    // Middle Eastern Cuisines
    'Middle Eastern', 'Turkish', 'Lebanese', 'Persian', 'Falafel', 'Kebab',
    
    // Other Categories
    'Seafood', 'Vegetarian', 'Vegan', 'Breakfast', 'Brunch', 'Cafe', 'Deli', 
    'Sandwich', 'Fast Food', 'Food Court', 'Buffet', 'Fine Dining', 'Pub Food', 
    'Wings', 'Noodles', 'Healthy', 'Salad', 'Ice Cream', 'Dessert', 'Coffee Shop'
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async categorizeBatch(restaurants: any[]): Promise<Map<string, string>> {
    const cuisineMap = new Map<string, string>();
    const batchSize = 20;
    
    for (let i = 0; i < restaurants.length; i += batchSize) {
      const batch = restaurants.slice(i, Math.min(i + batchSize, restaurants.length));
      
      const prompt = `
        You are a restaurant cuisine classifier. Your task is to categorize each restaurant into its most specific cuisine type.
        Never use "Other" as a category. Always choose the closest matching cuisine type from the list.
        Consider the restaurant name, location, and any available details to make the best determination.
        If a restaurant could fit multiple categories, choose the most specific one.
        
        Available cuisine types:
        ${this.cuisineTypes.join(', ')}

        Restaurants to analyze:
        ${batch.map((r, index) => `
          ${index + 1}. Name: ${r.name}
          Address: ${r.vicinity}
          Types: ${r.types?.join(', ')}
          Price Level: ${r.price_level || 'Unknown'}
          Rating: ${r.rating || 'Unknown'}
        `).join('\n')}

        For each restaurant, provide:
        1. Primary cuisine type (must be from the list above)
        2. Brief explanation of why (one line)

        Format your response as:
        1. Cuisine - Reason
        2. Cuisine - Reason
        etc.
      `;

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert restaurant classifier with deep knowledge of global cuisines. You must categorize every restaurant with a specific cuisine type, never using 'Other' or generic categories unless absolutely certain."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2,
        });

        const lines = response.choices[0].message.content
          ?.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const match = line.match(/\d+\.\s+([^-]+)/);
            return match ? match[1].trim() : null;
          });

        batch.forEach((restaurant, index) => {
          if (lines && lines[index]) {
            cuisineMap.set(restaurant.place_id, lines[index]);
          }
        });

        // Log the categorizations for debugging
        batch.forEach((restaurant, index) => {
          console.log(`${restaurant.name} => ${lines?.[index]}`);
        });

        if (i + batchSize < restaurants.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback to best-guess categorization
        batch.forEach(restaurant => {
          const bestGuess = this.fallbackCategorize(restaurant);
          cuisineMap.set(restaurant.place_id, bestGuess);
        });
      }
    }

    // Log distribution
    const distribution = Array.from(cuisineMap.values()).reduce((acc, cuisine) => {
      acc[cuisine] = (acc[cuisine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Cuisine distribution:', distribution);

    return cuisineMap;
  }

  private fallbackCategorize(restaurant: any): string {
    const searchText = `${restaurant.name} ${restaurant.vicinity} ${restaurant.types?.join(' ')}`.toLowerCase();
    
    // Simple keyword matching as fallback
    const matches = this.cuisineTypes.filter(cuisine => 
      searchText.includes(cuisine.toLowerCase())
    );

    if (matches.length > 0) {
      // Return the longest matching cuisine name (usually more specific)
      return matches.reduce((a, b) => a.length > b.length ? a : b);
    }

    // If no match, check if it's a restaurant and make an educated guess
    if (restaurant.types?.includes('restaurant')) {
      if (restaurant.price_level >= 3) return 'Fine Dining';
      if (restaurant.types?.includes('cafe')) return 'Cafe';
      if (restaurant.types?.includes('fast_food')) return 'Fast Food';
      return 'American'; // Default to American if nothing else matches
    }

    return 'Cafe'; // Last resort fallback
  }
}

export default new OpenAIService(); 