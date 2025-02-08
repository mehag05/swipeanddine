import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GameStage } from '../types/restaurant';

interface BudgetSelectorProps {
  priceLevel: number | null;
  setPriceLevel: (price: number) => void;
  setGameStage: (stage: GameStage) => void;
}

export const BudgetSelector = ({ priceLevel, setPriceLevel, setGameStage }: BudgetSelectorProps) => (
  <View style={styles.container}>
    <Text style={styles.question}>What's your budget?</Text>
    <View style={styles.budgetContainer}>
      {[1, 2, 3, 4].map((price) => (
        <TouchableOpacity 
          key={price}
          style={[styles.budgetOption, priceLevel === price && styles.selectedBudget]}
          onPress={() => {
            setPriceLevel(price);
            setGameStage('start');
          }}
        >
          <Text style={styles.budgetText}>{'$'.repeat(price)}</Text>
          <Text style={styles.budgetDescription}>
            {price === 1 ? 'Inexpensive' : 
             price === 2 ? 'Moderate' : 
             price === 3 ? 'Expensive' : 
             'Very Expensive'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  budgetContainer: {
    padding: 20,
    gap: 15,
  },
  budgetOption: {
    backgroundColor: 'white',
    padding: 20,
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
}); 