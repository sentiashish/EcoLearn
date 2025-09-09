import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  TrophyIcon,
  ClockIcon,
  BoltIcon,
  HeartIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  CarIcon,
  LightBulbIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

interface GameResult {
  score: number;
  xpEarned: number;
  timeSpent: number;
  accuracy: number;
  achievements?: string[];
}

interface MiniGameProps {
  onGameComplete: (result: GameResult) => void;
  onClose: () => void;
}

// Carbon Footprint Calculator Game
const CarbonFootprintGame: React.FC<MiniGameProps> = ({ onGameComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'transport',
      title: 'Transportation',
      question: 'How many miles do you drive per week?',
      options: [
        { label: '0-50 miles', value: 0.5, icon: '🚶' },
        { label: '50-150 miles', value: 1.5, icon: '🚗' },
        { label: '150-300 miles', value: 3.0, icon: '🚙' },
        { label: '300+ miles', value: 5.0, icon: '🚛' }
      ],
      multiplier: 0.89 // kg CO2 per mile
    },
    {
      id: 'energy',
      title: 'Home Energy',
      question: 'What\'s your monthly electricity bill?',
      options: [
        { label: '$0-50', value: 1, icon: '💡' },
        { label: '$50-100', value: 2, icon: '🏠' },
        { label: '$100-200', value: 3, icon: '🏘️' },
        { label: '$200+', value: 4, icon: '🏭' }
      ],
      multiplier: 50 // kg CO2 per unit
    },
    {
      id: 'diet',
      title: 'Diet',
      question: 'How often do you eat meat?',
      options: [
        { label: 'Never (Vegan)', value: 1, icon: '🥗' },
        { label: 'Rarely (Vegetarian)', value: 2, icon: '🥛' },
        { label: 'Sometimes', value: 3, icon: '🍗' },
        { label: 'Daily', value: 4, icon: '🥩' }
      ],
      multiplier: 30 // kg CO2 per unit
    },
    {
      id: 'waste',
      title: 'Waste',
      question: 'How much do you recycle?',
      options: [
        { label: 'Everything possible', value: 0.5, icon: '♻️' },
        { label: 'Most things', value: 1, icon: '🗂️' },
        { label: 'Some things', value: 2, icon: '🗑️' },
        { label: 'Very little', value: 3, icon: '🚮' }
      ],
      multiplier: 20 // kg CO2 per unit
    }
  ];

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateFootprint();
    }
  };

  const calculateFootprint = () => {
    let total = 0;
    questions.forEach(q => {
      const answer = answers[q.id] || 0;
      total += answer * q.multiplier;
    });
    setTotalFootprint(total);
    setShowResult(true);
  };

  const getFootprintRating = (footprint: number) => {
    if (footprint < 200) return { rating: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (footprint < 400) return { rating: 'Good', color: 'text-blue-600', emoji: '👍' };
    if (footprint < 600) return { rating: 'Average', color: 'text-yellow-600', emoji: '⚖️' };
    return { rating: 'Needs Improvement', color: 'text-red-600', emoji: '⚠️' };
  };

  const finishGame = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const rating = getFootprintRating(totalFootprint);
    const score = Math.max(0, 1000 - Math.floor(totalFootprint));
    const xpEarned = Math.floor(score / 10) + 50;
    
    onGameComplete({
      score,
      xpEarned,
      timeSpent,
      accuracy: rating.rating === 'Excellent' ? 100 : rating.rating === 'Good' ? 80 : 60,
      achievements: rating.rating === 'Excellent' ? ['eco-champion'] : []
    });
  };

  if (showResult) {
    const rating = getFootprintRating(totalFootprint);
    
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-4"
        >
          {rating.emoji}
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Carbon Footprint</h3>
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {Math.round(totalFootprint)} kg CO₂/month
        </div>
        <div className={`text-lg font-medium mb-6 ${rating.color}`}>
          {rating.rating}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Ways to Improve:</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🚲</span>
              <span>Use public transport or bike more often</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">💡</span>
              <span>Switch to LED bulbs and energy-efficient appliances</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">🥗</span>
              <span>Try plant-based meals a few times per week</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">♻️</span>
              <span>Increase recycling and reduce waste</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={finishGame}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Complete Game
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{currentQuestion.title}</h3>
          <div className="text-sm text-gray-600">
            {currentStep + 1} / {questions.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        <p className="text-lg text-gray-700 mb-6">{currentQuestion.question}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(currentQuestion.id, option.value)}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
          >
            <div className="text-2xl">{option.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Recycling Sorter Game
const RecyclingSorterGame: React.FC<MiniGameProps> = ({ onGameComplete, onClose }) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [gameActive, setGameActive] = useState(false);
  const [startTime] = useState(Date.now());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);

  const items = [
    { name: 'Plastic Bottle', emoji: '🍼', category: 'plastic', color: 'bg-blue-100' },
    { name: 'Newspaper', emoji: '📰', category: 'paper', color: 'bg-yellow-100' },
    { name: 'Glass Jar', emoji: '🫙', category: 'glass', color: 'bg-green-100' },
    { name: 'Aluminum Can', emoji: '🥤', category: 'metal', color: 'bg-gray-100' },
    { name: 'Apple Core', emoji: '🍎', category: 'organic', color: 'bg-brown-100' },
    { name: 'Pizza Box', emoji: '📦', category: 'paper', color: 'bg-yellow-100' },
    { name: 'Milk Carton', emoji: '🥛', category: 'paper', color: 'bg-yellow-100' },
    { name: 'Tin Can', emoji: '🥫', category: 'metal', color: 'bg-gray-100' },
    { name: 'Wine Bottle', emoji: '🍷', category: 'glass', color: 'bg-green-100' },
    { name: 'Banana Peel', emoji: '🍌', category: 'organic', color: 'bg-brown-100' }
  ];

  const bins = [
    { name: 'Plastic', category: 'plastic', color: 'bg-blue-500', emoji: '♻️' },
    { name: 'Paper', category: 'paper', color: 'bg-yellow-500', emoji: '📄' },
    { name: 'Glass', category: 'glass', color: 'bg-green-500', emoji: '🫙' },
    { name: 'Metal', category: 'metal', color: 'bg-gray-500', emoji: '🔩' },
    { name: 'Organic', category: 'organic', color: 'bg-amber-600', emoji: '🌱' }
  ];

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 || lives === 0) {
      endGame();
    }
  }, [timeLeft, gameActive, lives]);

  useEffect(() => {
    if (gameActive && !currentItem) {
      generateNewItem();
    }
  }, [gameActive, currentItem]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    generateNewItem();
  };

  const generateNewItem = () => {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    setCurrentItem(randomItem);
  };

  const handleSort = (binCategory: string) => {
    if (!currentItem) return;
    
    setTotalAnswers(prev => prev + 1);
    
    if (binCategory === currentItem.category) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      generateNewItem();
    } else {
      setLives(prev => prev - 1);
      generateNewItem();
    }
  };

  const endGame = () => {
    setGameActive(false);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const xpEarned = score + (accuracy > 80 ? 50 : accuracy > 60 ? 30 : 10);
    
    onGameComplete({
      score,
      xpEarned,
      timeSpent,
      accuracy,
      achievements: accuracy > 90 ? ['recycling-master'] : []
    });
  };

  if (!gameActive && score === 0) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">♻️</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Recycling Sorter</h3>
        <p className="text-gray-600 mb-6">
          Sort items into the correct recycling bins as fast as you can!
          You have 60 seconds and 3 lives.
        </p>
        
        <div className="grid grid-cols-5 gap-2 mb-6">
          {bins.map((bin) => (
            <div key={bin.category} className="text-center">
              <div className={`w-12 h-12 ${bin.color} rounded-lg flex items-center justify-center text-white text-xl mx-auto mb-1`}>
                {bin.emoji}
              </div>
              <div className="text-xs text-gray-600">{bin.name}</div>
            </div>
          ))}
        </div>
        
        <button
          onClick={startGame}
          className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (!gameActive) {
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-4"
        >
          {accuracy > 80 ? '🏆' : accuracy > 60 ? '👍' : '💪'}
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Recycling Tips:</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• Clean containers before recycling</div>
            <div>• Remove caps from bottles</div>
            <div>• Check local recycling guidelines</div>
            <div>• Compost organic waste when possible</div>
          </div>
        </div>
        
        <button
          onClick={() => onGameComplete({
            score,
            xpEarned: score + (accuracy > 80 ? 50 : 30),
            timeSpent: Math.floor((Date.now() - startTime) / 1000),
            accuracy
          })}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Complete Game
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TrophyIconSolid className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-gray-900">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <HeartIconSolid
                key={i}
                className={`h-5 w-5 ${i < lives ? 'text-red-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 text-blue-600">
          <ClockIcon className="h-5 w-5" />
          <span className="font-bold">{timeLeft}s</span>
        </div>
      </div>
      
      {/* Current Item */}
      {currentItem && (
        <div className="text-center mb-8">
          <motion.div
            key={currentItem.name}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`w-32 h-32 ${currentItem.color} rounded-full flex items-center justify-center text-6xl mx-auto mb-4`}
          >
            {currentItem.emoji}
          </motion.div>
          <h4 className="text-xl font-bold text-gray-900">{currentItem.name}</h4>
          <p className="text-gray-600">Drag to the correct bin!</p>
        </div>
      )}
      
      {/* Recycling Bins */}
      <div className="grid grid-cols-5 gap-3">
        {bins.map((bin) => (
          <motion.button
            key={bin.category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort(bin.category)}
            className={`${bin.color} text-white rounded-lg p-4 text-center hover:opacity-90 transition-all`}
          >
            <div className="text-3xl mb-2">{bin.emoji}</div>
            <div className="text-sm font-medium">{bin.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Main Mini Games Component
const EnvironmentalMiniGames: React.FC<{
  onGameComplete: (gameType: string, result: GameResult) => void;
  onClose: () => void;
}> = ({ onGameComplete, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'carbon-footprint',
      name: 'Carbon Footprint Calculator',
      description: 'Calculate and learn about your environmental impact',
      icon: '🌍',
      difficulty: 'Easy',
      duration: '5 min',
      xpReward: '50-150 XP',
      component: CarbonFootprintGame
    },
    {
      id: 'recycling-sorter',
      name: 'Recycling Sorter',
      description: 'Sort waste into the correct recycling bins',
      icon: '♻️',
      difficulty: 'Medium',
      duration: '2 min',
      xpReward: '30-100 XP',
      component: RecyclingSorterGame
    }
  ];

  const handleGameComplete = (result: GameResult) => {
    onGameComplete(selectedGame!, result);
    setSelectedGame(null);
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (!game) return null;
    
    const GameComponent = game.component;
    
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{game.icon}</div>
              <div>
                <h2 className="text-xl font-bold">{game.name}</h2>
                <p className="opacity-90">{game.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedGame(null)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <GameComponent onGameComplete={handleGameComplete} onClose={onClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🎮</div>
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">Environmental Mini Games</h1>
        <p className="text-lg opacity-90">Learn about the environment through fun, interactive games!</p>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.02 }}
              className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{game.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
                <p className="text-gray-600">{game.description}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    game.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">{game.duration}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">XP Reward:</span>
                  <span className="text-sm font-medium text-green-600">{game.xpReward}</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <PlayIcon className="h-5 w-5" />
                Play Game
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Back to Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalMiniGames;
export type { GameResult };
export { CarbonFootprintGame, RecyclingSorterGame };