import React, { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  answer: number;
  fact: string;
}

interface EcoQuizProps {
  onComplete?: (result: { score: number; points: number; xpEarned: number; timeSpent: number; accuracy: number }) => void;
  onClose?: () => void;
}

const questions: Question[] = [
  {
    question: "What is the primary greenhouse gas responsible for climate change?",
    options: ["Methane", "Carbon Dioxide", "Nitrous Oxide", "Water Vapor"],
    answer: 1,
    fact: "Carbon dioxide (CO2) accounts for about 76% of total greenhouse gas emissions. The largest source of CO2 emissions is from burning fossil fuels for electricity, heat, and transportation."
  },
  {
    question: "Which of these is a renewable source of energy?",
    options: ["Natural Gas", "Coal", "Solar Power", "Nuclear Energy"],
    answer: 2,
    fact: "Solar power is renewable because it harnesses energy from the sun, which is expected to last for another 5 billion years. Unlike fossil fuels, solar energy doesn't produce greenhouse gas emissions during operation."
  },
  {
    question: "What percentage of Earth's water is freshwater available for human use?",
    options: ["About 10%", "About 5%", "About 1%", "About 0.5%"],
    answer: 3,
    fact: "While 71% of the Earth's surface is water, only 2.5% is freshwater. Most of that is locked in glaciers and ice caps, leaving less than 0.5% of all Earth's water available for human use."
  },
  {
    question: "Which of these materials takes the longest to decompose in nature?",
    options: ["Paper", "Aluminum can", "Plastic bottle", "Glass bottle"],
    answer: 3,
    fact: "Glass takes up to 1 million years to decompose in the environment. However, glass is 100% recyclable and can be recycled endlessly without loss in quality or purity."
  },
  {
    question: "What is the main cause of ocean acidification?",
    options: ["Oil spills", "Plastic pollution", "Excess CO2 absorption", "Sewage runoff"],
    answer: 2,
    fact: "The ocean absorbs about 30% of the CO2 released into the atmosphere. When CO2 dissolves in seawater, it forms carbonic acid, which lowers the ocean's pH, making it more acidic and threatening marine ecosystems."
  },
  {
    question: "Which ecosystem is considered the most biodiverse on Earth?",
    options: ["Coral reefs", "Tropical rainforests", "Mangrove forests", "Deep sea vents"],
    answer: 1,
    fact: "Although tropical rainforests cover less than 2% of Earth's surface, they are home to more than 50% of the world's plant and animal species. A single hectare may contain over 750 types of trees and 1500 species of plants."
  },
  {
    question: "What is the 'Great Pacific Garbage Patch' primarily composed of?",
    options: ["Industrial waste", "Fishing nets", "Microplastics", "Sewage sludge"],
    answer: 2,
    fact: "The Great Pacific Garbage Patch is mostly microplastics - small plastic fragments less than 5mm in size. It's estimated to contain 1.8 trillion pieces of plastic, weighing about 80,000 tons."
  },
  {
    question: "Which of these actions reduces your carbon footprint the most?",
    options: ["Recycling plastic", "Using reusable bags", "Eating less meat", "Taking shorter showers"],
    answer: 2,
    fact: "A vegetarian diet has about half the carbon footprint of a meat-heavy diet. Livestock production generates 14.5% of all anthropogenic greenhouse gas emissions - more than all transportation combined."
  },
  {
    question: "What is the leading cause of deforestation worldwide?",
    options: ["Urban expansion", "Agriculture", "Logging", "Mining"],
    answer: 1,
    fact: "Agriculture drives around 80% of deforestation worldwide. Commercial agriculture (especially cattle ranching, and cultivation of soy and palm oil) is the largest driver, followed by subsistence farming."
  },
  {
    question: "Which country generates the most renewable energy?",
    options: ["United States", "Germany", "China", "Norway"],
    answer: 2,
    fact: "China is the world's largest producer of renewable energy, particularly hydropower, solar power, and wind power. In 2020, China accounted for over 40% of global renewable capacity growth."
  }
];

const EcoQuiz: React.FC<EcoQuizProps> = ({ onComplete, onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [startTime] = useState(Date.now());

  const startGame = () => {
    setCurrentScreen('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setPoints(0);
    setSelectedOption(null);
    setShowFact(false);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    
    if (optionIndex === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
      setPoints(points + 10); // Add 10 points for correct answer
    }
    // No points added for wrong answer (0 points)
    
    setShowFact(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFact(false);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    const accuracy = (score / questions.length) * 100;
    const xpEarned = Math.round(50 + (score * 10) + Math.max(0, 100 - timeSpent));

    setCurrentScreen('result');
    
    if (onComplete) {
      onComplete({ score, points, xpEarned, timeSpent, accuracy });
    }
  };

  const restartGame = () => {
    setCurrentScreen('start');
    setCurrentQuestionIndex(0);
    setScore(0);
    setPoints(0);
    setSelectedOption(null);
    setShowFact(false);
  };

  if (currentScreen === 'start') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">🌍 EcoKnowledge Quiz</h1>
          <p className="text-green-100">Test your environmental knowledge and earn XP!</p>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Ready to Test Your Environmental Knowledge?</h2>
          <p className="text-gray-600 mb-4">Answer 10 questions about environmental topics and earn XP!</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">Scoring System:</h3>
            <p className="text-green-700 text-sm">
              • Correct Answer: <span className="font-bold">+10 points</span><br/>
              • Wrong Answer: <span className="font-bold">0 points</span><br/>
              • Maximum Score: <span className="font-bold">{questions.length * 10} points</span>
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Quiz
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">EcoKnowledge Quiz</h1>
            <div className="text-right">
              <span className="text-green-100">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div className="text-lg font-semibold">Points: {points}</div>
            </div>
          </div>
          <div className="w-full bg-green-300 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                  selectedOption === null 
                    ? 'border-gray-200 hover:border-green-300 hover:bg-green-50' 
                    : index === currentQuestion.answer
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : index === selectedOption
                        ? 'border-red-500 bg-red-100 text-red-800'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>

          {showFact && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                {selectedOption === currentQuestion.answer ? '✅ Correct!' : '❌ Incorrect'}
              </h3>
              <p className="text-blue-700 text-sm">{currentQuestion.fact}</p>
            </div>
          )}

          {selectedOption !== null && (
            <div className="text-center">
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'result') {
    const timeSpent = (Date.now() - startTime) / 1000;
    const accuracy = (score / questions.length) * 100;
    const xpEarned = Math.round(50 + (score * 10) + Math.max(0, 100 - timeSpent));

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 text-center">
          <div className="text-6xl mb-4">
            {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '👏' : '💪'}
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-green-100">
            {accuracy >= 80 ? 'Excellent work!' : accuracy >= 60 ? 'Good job!' : 'Keep learning!'}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{points}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{Math.round(timeSpent)}s</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">+{xpEarned}</div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
            >
              Take Quiz Again
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EcoQuiz;
