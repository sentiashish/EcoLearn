import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon as SunIcon,
  CloudIcon,
  BeakerIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

interface Species {
  id: string;
  name: string;
  emoji: string;
  type: 'producer' | 'primary_consumer' | 'secondary_consumer' | 'tertiary_consumer' | 'decomposer';
  habitat: 'land' | 'water' | 'air' | 'underground';
  population: number;
  maxPopulation: number;
  energyRequirement: number;
  energyProduction: number;
  preySpecies: string[];
  predatorSpecies: string[];
  description: string;
  facts: string[];
}

interface EcosystemState {
  biodiversityIndex: number;
  energyFlow: number;
  stability: number;
  pollution: number;
  temperature: number;
  rainfall: number;
}

interface EcosystemBuilderProps {
  onComplete: (result: any) => void;
  onClose: () => void;
}

const EcosystemBuilder: React.FC<EcosystemBuilderProps> = ({ onComplete, onClose }) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  const [ecosystemState, setEcosystemState] = useState<EcosystemState>({
    biodiversityIndex: 0,
    energyFlow: 0,
    stability: 0,
    pollution: 0,
    temperature: 20,
    rainfall: 50
  });
  const [selectedInfo, setSelectedInfo] = useState<Species | null>(null);
  const [gamePhase, setGamePhase] = useState<'building' | 'simulation' | 'results'>('building');
  const [simulationTime, setSimulationTime] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  const availableSpecies: Species[] = [
    // Producers
    {
      id: 'grass',
      name: 'Grass',
      emoji: '🌱',
      type: 'producer',
      habitat: 'land',
      population: 0,
      maxPopulation: 1000,
      energyRequirement: 0,
      energyProduction: 100,
      preySpecies: [],
      predatorSpecies: ['rabbit', 'deer', 'grasshopper'],
      description: 'Primary producer that converts sunlight into energy',
      facts: [
        'Produces oxygen through photosynthesis',
        'Forms the base of most food chains',
        'Can grow in various soil conditions'
      ]
    },
    {
      id: 'trees',
      name: 'Trees',
      emoji: '🌳',
      type: 'producer',
      habitat: 'land',
      population: 0,
      maxPopulation: 100,
      energyRequirement: 0,
      energyProduction: 200,
      preySpecies: [],
      predatorSpecies: ['deer', 'squirrel'],
      description: 'Large producers that provide habitat and oxygen',
      facts: [
        'Can live for hundreds of years',
        'Provide shelter for many animals',
        'Help prevent soil erosion'
      ]
    },
    {
      id: 'algae',
      name: 'Algae',
      emoji: '🦠',
      type: 'producer',
      habitat: 'water',
      population: 0,
      maxPopulation: 2000,
      energyRequirement: 0,
      energyProduction: 80,
      preySpecies: [],
      predatorSpecies: ['fish', 'zooplankton'],
      description: 'Aquatic producers that form the base of water food chains',
      facts: [
        'Produces most of Earth\'s oxygen',
        'Can double in population daily',
        'Essential for aquatic ecosystems'
      ]
    },
    // Primary Consumers
    {
      id: 'rabbit',
      name: 'Rabbit',
      emoji: '🐰',
      type: 'primary_consumer',
      habitat: 'land',
      population: 0,
      maxPopulation: 200,
      energyRequirement: 50,
      energyProduction: 30,
      preySpecies: ['grass'],
      predatorSpecies: ['fox', 'hawk'],
      description: 'Small herbivore that feeds on grass and plants',
      facts: [
        'Can reproduce very quickly',
        'Important prey for many predators',
        'Help disperse plant seeds'
      ]
    },
    {
      id: 'deer',
      name: 'Deer',
      emoji: '🦌',
      type: 'primary_consumer',
      habitat: 'land',
      population: 0,
      maxPopulation: 50,
      energyRequirement: 100,
      energyProduction: 80,
      preySpecies: ['grass', 'trees'],
      predatorSpecies: ['wolf'],
      description: 'Large herbivore that browses on plants and trees',
      facts: [
        'Can jump up to 8 feet high',
        'Have excellent hearing and smell',
        'Play important role in forest ecology'
      ]
    },
    {
      id: 'fish',
      name: 'Small Fish',
      emoji: '🐟',
      type: 'primary_consumer',
      habitat: 'water',
      population: 0,
      maxPopulation: 500,
      energyRequirement: 30,
      energyProduction: 25,
      preySpecies: ['algae'],
      predatorSpecies: ['big_fish', 'bird'],
      description: 'Small aquatic herbivores that feed on algae',
      facts: [
        'Form large schools for protection',
        'Filter water while feeding',
        'Important food source for larger fish'
      ]
    },
    // Secondary Consumers
    {
      id: 'fox',
      name: 'Fox',
      emoji: '🦊',
      type: 'secondary_consumer',
      habitat: 'land',
      population: 0,
      maxPopulation: 20,
      energyRequirement: 80,
      energyProduction: 40,
      preySpecies: ['rabbit'],
      predatorSpecies: ['wolf'],
      description: 'Cunning predator that hunts small mammals',
      facts: [
        'Very intelligent and adaptable',
        'Can hear prey moving underground',
        'Help control rodent populations'
      ]
    },
    {
      id: 'hawk',
      name: 'Hawk',
      emoji: '🦅',
      type: 'secondary_consumer',
      habitat: 'air',
      population: 0,
      maxPopulation: 10,
      energyRequirement: 60,
      energyProduction: 35,
      preySpecies: ['rabbit'],
      predatorSpecies: [],
      description: 'Aerial predator with excellent eyesight',
      facts: [
        'Can see prey from miles away',
        'Dive at speeds up to 150 mph',
        'Important for controlling small mammal populations'
      ]
    },
    {
      id: 'big_fish',
      name: 'Large Fish',
      emoji: '🐠',
      type: 'secondary_consumer',
      habitat: 'water',
      population: 0,
      maxPopulation: 50,
      energyRequirement: 70,
      energyProduction: 50,
      preySpecies: ['fish'],
      predatorSpecies: [],
      description: 'Predatory fish that hunt smaller fish',
      facts: [
        'Use lateral line to detect movement',
        'Important for maintaining fish population balance',
        'Some species can live for decades'
      ]
    },
    // Tertiary Consumers
    {
      id: 'wolf',
      name: 'Wolf',
      emoji: '🐺',
      type: 'tertiary_consumer',
      habitat: 'land',
      population: 0,
      maxPopulation: 5,
      energyRequirement: 150,
      energyProduction: 100,
      preySpecies: ['deer', 'fox'],
      predatorSpecies: [],
      description: 'Apex predator that hunts in packs',
      facts: [
        'Live and hunt in family groups',
        'Can travel 50+ miles per day',
        'Key species for ecosystem balance'
      ]
    },
    // Decomposers
    {
      id: 'mushroom',
      name: 'Mushrooms',
      emoji: '🍄',
      type: 'decomposer',
      habitat: 'underground',
      population: 0,
      maxPopulation: 300,
      energyRequirement: 20,
      energyProduction: 0,
      preySpecies: [],
      predatorSpecies: [],
      description: 'Decomposers that recycle nutrients back to soil',
      facts: [
        'Break down dead organic matter',
        'Essential for nutrient cycling',
        'Form vast underground networks'
      ]
    }
  ];

  const calculateEcosystemHealth = useCallback(() => {
    if (selectedSpecies.length === 0) {
      setEcosystemState({
        biodiversityIndex: 0,
        energyFlow: 0,
        stability: 0,
        pollution: 0,
        temperature: 20,
        rainfall: 50
      });
      return;
    }

    // Calculate biodiversity (Shannon diversity index simplified)
    const totalPopulation = selectedSpecies.reduce((sum, species) => sum + species.population, 0);
    let biodiversity = 0;
    if (totalPopulation > 0) {
      selectedSpecies.forEach(species => {
        if (species.population > 0) {
          const proportion = species.population / totalPopulation;
          biodiversity -= proportion * Math.log(proportion);
        }
      });
    }

    // Calculate energy flow efficiency
    const producers = selectedSpecies.filter(s => s.type === 'producer');
    const consumers = selectedSpecies.filter(s => s.type !== 'producer' && s.type !== 'decomposer');
    const totalEnergyProduced = producers.reduce((sum, p) => sum + (p.population * p.energyProduction), 0);
    const totalEnergyConsumed = consumers.reduce((sum, c) => sum + (c.population * c.energyRequirement), 0);
    const energyFlow = totalEnergyProduced > 0 ? Math.min(100, (totalEnergyConsumed / totalEnergyProduced) * 100) : 0;

    // Calculate stability (balance between trophic levels)
    const trophicLevels = {
      producer: selectedSpecies.filter(s => s.type === 'producer').reduce((sum, s) => sum + s.population, 0),
      primary: selectedSpecies.filter(s => s.type === 'primary_consumer').reduce((sum, s) => sum + s.population, 0),
      secondary: selectedSpecies.filter(s => s.type === 'secondary_consumer').reduce((sum, s) => sum + s.population, 0),
      tertiary: selectedSpecies.filter(s => s.type === 'tertiary_consumer').reduce((sum, s) => sum + s.population, 0),
      decomposer: selectedSpecies.filter(s => s.type === 'decomposer').reduce((sum, s) => sum + s.population, 0)
    };

    let stability = 100;
    if (trophicLevels.producer === 0 && (trophicLevels.primary > 0 || trophicLevels.secondary > 0)) {
      stability -= 50; // No producers but consumers exist
    }
    if (trophicLevels.tertiary > trophicLevels.secondary) {
      stability -= 30; // Too many top predators
    }
    if (trophicLevels.decomposer === 0 && totalPopulation > 100) {
      stability -= 20; // No decomposers in large ecosystem
    }

    setEcosystemState({
      biodiversityIndex: Math.round(biodiversity * 100) / 100,
      energyFlow: Math.round(energyFlow),
      stability: Math.max(0, Math.round(stability)),
      pollution: Math.max(0, 100 - stability),
      temperature: 20 + (Math.random() - 0.5) * 2,
      rainfall: 50 + (Math.random() - 0.5) * 10
    });

    // Generate warnings
    const newWarnings: string[] = [];
    if (trophicLevels.producer === 0 && trophicLevels.primary > 0) {
      newWarnings.push('No producers! Herbivores will starve.');
    }
    if (trophicLevels.tertiary > trophicLevels.secondary * 2) {
      newWarnings.push('Too many apex predators! Food shortage likely.');
    }
    if (trophicLevels.decomposer === 0 && totalPopulation > 50) {
      newWarnings.push('No decomposers! Dead matter will accumulate.');
    }
    if (energyFlow < 30) {
      newWarnings.push('Low energy flow! Add more producers.');
    }
    setWarnings(newWarnings);

    // Check for achievements
    const newAchievements: string[] = [];
    if (biodiversity > 1.5) newAchievements.push('Biodiversity Champion');
    if (stability > 90) newAchievements.push('Ecosystem Master');
    if (selectedSpecies.length >= 8) newAchievements.push('Species Collector');
    if (energyFlow > 80 && energyFlow < 95) newAchievements.push('Perfect Balance');
    setAchievements(newAchievements);
  }, [selectedSpecies]);

  useEffect(() => {
    calculateEcosystemHealth();
  }, [selectedSpecies, calculateEcosystemHealth]);

  const addSpecies = (species: Species) => {
    const existing = selectedSpecies.find(s => s.id === species.id);
    if (existing) {
      if (existing.population < existing.maxPopulation) {
        setSelectedSpecies(prev => prev.map(s => 
          s.id === species.id 
            ? { ...s, population: Math.min(s.population + 10, s.maxPopulation) }
            : s
        ));
      }
    } else {
      setSelectedSpecies(prev => [...prev, { ...species, population: 10 }]);
    }
  };

  const removeSpecies = (speciesId: string) => {
    const existing = selectedSpecies.find(s => s.id === speciesId);
    if (existing && existing.population > 10) {
      setSelectedSpecies(prev => prev.map(s => 
        s.id === speciesId 
          ? { ...s, population: s.population - 10 }
          : s
      ));
    } else {
      setSelectedSpecies(prev => prev.filter(s => s.id !== speciesId));
    }
  };

  const startSimulation = () => {
    setGamePhase('simulation');
    setSimulationTime(0);
    
    // Simulate ecosystem changes over time
    const interval = setInterval(() => {
      setSimulationTime(prev => {
        if (prev >= 10) {
          clearInterval(interval);
          setGamePhase('results');
          return prev;
        }
        return prev + 1;
      });
      
      // Simulate population changes
      setSelectedSpecies(prev => prev.map(species => {
        let newPopulation = species.population;
        
        // Growth/decline based on food availability and predation
        if (species.type === 'producer') {
          newPopulation = Math.min(species.maxPopulation, newPopulation * 1.1);
        } else {
          const hasFood = species.preySpecies.some(preyId => 
            prev.find(s => s.id === preyId && s.population > 0)
          );
          const predatorPressure = species.predatorSpecies.reduce((pressure, predId) => {
            const predator = prev.find(s => s.id === predId);
            return pressure + (predator ? predator.population * 0.1 : 0);
          }, 0);
          
          if (hasFood) {
            newPopulation = Math.min(species.maxPopulation, newPopulation * 1.05);
          } else {
            newPopulation = newPopulation * 0.9;
          }
          
          newPopulation = Math.max(0, newPopulation - predatorPressure);
        }
        
        return { ...species, population: Math.round(newPopulation) };
      }));
    }, 1000);
  };

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (gamePhase === 'results') {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.round(
      (ecosystemState.biodiversityIndex * 100) +
      ecosystemState.energyFlow +
      ecosystemState.stability
    );
    
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            {ecosystemState.stability > 80 ? '🏆' : ecosystemState.stability > 60 ? '🌟' : '🌱'}
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Ecosystem Simulation Complete!</h2>
          <p className="text-lg opacity-90">Your ecosystem has evolved over time</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{ecosystemState.stability}%</div>
              <div className="text-sm text-gray-600">Stability</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{ecosystemState.biodiversityIndex}</div>
              <div className="text-sm text-gray-600">Biodiversity</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{selectedSpecies.length}</div>
              <div className="text-sm text-gray-600">Species</div>
            </div>
          </div>
          
          {achievements.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <StarIconSolid className="h-5 w-5" />
                Achievements Unlocked!
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What You Learned:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Ecosystems need balance between producers, consumers, and decomposers</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Biodiversity makes ecosystems more stable and resilient</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Energy flows from producers to top predators in food chains</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Every species plays an important role in ecosystem health</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setGamePhase('building');
                setSelectedSpecies([]);
                setSimulationTime(0);
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Build New Ecosystem
            </button>
            <button
              onClick={() => onComplete({
                score,
                xpEarned: score + achievements.length * 25,
                timeSpent,
                accuracy: ecosystemState.stability,
                achievements
              })}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Complete Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'simulation') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 text-center">
          <div className="text-4xl mb-2">⏱️</div>
          <h2 className="text-2xl font-bold mb-2">Ecosystem Simulation Running...</h2>
          <p className="text-lg opacity-90">Watching your ecosystem evolve over time</p>
          <div className="mt-4">
            <div className="text-3xl font-bold">{simulationTime}/10</div>
            <div className="text-sm opacity-75">Years elapsed</div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${getHealthColor(ecosystemState.stability)}`}>
                {ecosystemState.stability}%
              </div>
              <div className="text-sm text-gray-600">Stability</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${getHealthColor(ecosystemState.energyFlow)}`}>
                {ecosystemState.energyFlow}%
              </div>
              <div className="text-sm text-gray-600">Energy Flow</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {ecosystemState.biodiversityIndex}
              </div>
              <div className="text-sm text-gray-600">Biodiversity</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {selectedSpecies.reduce((sum, s) => sum + s.population, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Population</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedSpecies.map((species) => (
              <motion.div
                key={species.id}
                layout
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <div className="text-3xl mb-2">{species.emoji}</div>
                <div className="font-medium text-gray-900 text-sm mb-1">{species.name}</div>
                <div className="text-lg font-bold text-blue-600">{species.population}</div>
                <div className="text-xs text-gray-500">population</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🌍 Ecosystem Builder</h1>
            <p className="text-lg opacity-90">Create a balanced ecosystem and watch it thrive!</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="flex">
        {/* Species Selection Panel */}
        <div className="w-1/3 border-r border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Available Species</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableSpecies.map((species) => {
              const inEcosystem = selectedSpecies.find(s => s.id === species.id);
              
              return (
                <div
                  key={species.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{species.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{species.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{species.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedInfo(species)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <InformationCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {inEcosystem && (
                    <div className="text-center mb-2">
                      <span className="text-sm font-medium text-blue-600">
                        Population: {inEcosystem.population}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => addSpecies(species)}
                      disabled={inEcosystem?.population >= species.maxPopulation}
                      className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <PlusIcon className="h-3 w-3" />
                      Add
                    </button>
                    {inEcosystem && (
                      <button
                        onClick={() => removeSpecies(species.id)}
                        className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <MinusIcon className="h-3 w-3" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Ecosystem Display */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Your Ecosystem</h3>
            {selectedSpecies.length > 0 && (
              <button
                onClick={startSimulation}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Run Simulation
              </button>
            )}
          </div>
          
          {/* Ecosystem Health Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Stability</div>
              <div className={`text-xl font-bold ${getHealthColor(ecosystemState.stability)}`}>
                {ecosystemState.stability}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${getHealthBgColor(ecosystemState.stability)}`}
                  style={{ width: `${ecosystemState.stability}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Energy Flow</div>
              <div className={`text-xl font-bold ${getHealthColor(ecosystemState.energyFlow)}`}>
                {ecosystemState.energyFlow}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${getHealthBgColor(ecosystemState.energyFlow)}`}
                  style={{ width: `${ecosystemState.energyFlow}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Biodiversity</div>
              <div className="text-xl font-bold text-purple-600">
                {ecosystemState.biodiversityIndex}
              </div>
              <div className="text-xs text-gray-500 mt-1">Shannon Index</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Species Count</div>
              <div className="text-xl font-bold text-yellow-600">
                {selectedSpecies.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total species</div>
            </div>
          </div>
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Ecosystem Warnings</span>
              </div>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-red-700">• {warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Species Grid */}
          {selectedSpecies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedSpecies.map((species) => (
                <motion.div
                  key={species.id}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                >
                  <div className="text-4xl mb-2">{species.emoji}</div>
                  <div className="font-medium text-gray-900 mb-1">{species.name}</div>
                  <div className="text-sm text-gray-600 mb-2 capitalize">
                    {species.type.replace('_', ' ')}
                  </div>
                  <div className="text-lg font-bold text-blue-600">{species.population}</div>
                  <div className="text-xs text-gray-500">population</div>
                  
                  <div className="mt-3 flex gap-1">
                    <button
                      onClick={() => addSpecies(species)}
                      disabled={species.population >= species.maxPopulation}
                      className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeSpecies(species.id)}
                      className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      -
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Ecosystem</h3>
              <p className="text-gray-600">Add species from the left panel to create a thriving ecosystem!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Species Info Modal */}
      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{selectedInfo.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900">{selectedInfo.name}</h3>
                <p className="text-gray-600 capitalize">{selectedInfo.type.replace('_', ' ')}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700">{selectedInfo.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fun Facts</h4>
                  <ul className="space-y-1">
                    {selectedInfo.facts.map((fact, index) => (
                      <li key={index} className="text-sm text-gray-700">• {fact}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Habitat:</span>
                    <span className="text-gray-700 ml-1 capitalize">{selectedInfo.habitat}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Max Population:</span>
                    <span className="text-gray-700 ml-1">{selectedInfo.maxPopulation}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedInfo(null)}
                className="w-full mt-6 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcosystemBuilder;