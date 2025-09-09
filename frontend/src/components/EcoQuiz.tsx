import React, { useState, useEffect } from 'react';

interface Question {
  question: string;
  options: string[];
  answer: number;
  fact: string;
}

interface EcoQuizProps {
  onComplete?: (result: { score: number; xpEarned: number; timeSpent: number; accuracy: number }) => void;
  onClose?: () => void;
}

const EcoQuiz: React.FC<EcoQuizProps> = ({ onComplete, onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [startTime] = useState(Date.now());

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
      options: ["Paper (2-6 weeks)", "Aluminum can (200-500 years)", "Plastic bottle (450 years)", "Glass bottle (1 million years)"],
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

  const startGame = () => {
    setCurrentScreen('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowFact(false);
  };

  const selectOption = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    setShowFact(true);
    
    if (index === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFact(false);
    } else {
      showResults();
    }
  };

  const showResults = () => {
    setCurrentScreen('result');
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (score / questions.length) * 100;
    const xpEarned = Math.floor(accuracy * 2); // XP based on accuracy
    
    if (onComplete) {
      onComplete({
        score,
        xpEarned,
        timeSpent,
        accuracy
      });
    }
  };

  const restartGame = () => {
    setCurrentScreen('start');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowFact(false);
  };

  const quitGame = () => {
    if (onClose) {
      onClose();
    } else {
      setCurrentScreen('start');
    }
  };

  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-400 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 text-white p-6 text-center">
          <h1 className="text-4xl font-bold mb-2">Eco Quiz</h1>
          <div className="text-lg opacity-90">Test Your Environmental Knowledge</div>
        </div>

        {/* Start Screen */}
        {currentScreen === 'start' && (
          <div className="p-8 text-center">
            <div className="text-8xl text-green-700 my-5">🌎</div>
            <h2 className="text-2xl font-bold mb-4">How well do you know our planet?</h2>
            <p className="mb-4">Take this quiz to test your knowledge about environmental issues, conservation, and sustainability.</p>
            <p className="mb-6">You'll be presented with 10 questions about our environment.</p>
            <button 
              onClick={startGame}
              className="bg-green-700 text-white px-10 py-4 text-xl rounded-full hover:bg-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Quiz
            </button>
          </div>
        )}

        {/* Quiz Screen */}
        {currentScreen === 'quiz' && (
          <div className="p-8">
            {/* Progress Bar */}
            <div className="flex items-center mb-5">
              <div className="flex-grow h-3 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                <div 
                  className="h-full bg-green-700 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="font-bold text-green-700 whitespace-nowrap">
                {currentQuestionIndex + 1}/{questions.length}
              </div>
            </div>

            {/* Question */}
            <div className="text-2xl mb-6 text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectOption(index)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 text-left text-lg rounded-xl border-2 transition-all duration-200 ${
                    selectedOption === null
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:translate-x-1'
                      : selectedOption === index
                      ? index === currentQuestion.answer
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-red-100 border-red-300 text-red-800'
                      : index === currentQuestion.answer
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextQuestion}
              disabled={selectedOption === null}
              className="bg-green-700 text-white px-8 py-3 text-lg rounded-lg ml-auto block transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-800"
            >
              {currentQuestionIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
            </button>

            {/* Fact Box */}
            {showFact && (
              <div className="mt-5 bg-green-50 border-l-4 border-green-700 p-4 rounded-r-lg">
                <div className="font-bold text-green-700 mb-2">Did You Know?</div>
                <div className="text-gray-700">{currentQuestion.fact}</div>
              </div>
            )}
          </div>
        )}

        {/* Result Screen */}
        {currentScreen === 'result' && (
          <div className="p-8 text-center">
            {/* Score Circle */}
            <div className="w-36 h-36 rounded-full bg-green-700 text-white flex flex-col justify-center items-center mx-auto mb-6 shadow-lg">
              <div className="text-lg mb-1">Your Score</div>
              <div className="text-5xl font-bold">{score}</div>
              <div className="text-sm">/{questions.length}</div>
            </div>

            {/* Message */}
            <div className="text-2xl mb-5 text-gray-800">
              {(() => {
                const percentage = (score / questions.length) * 100;
                if (percentage >= 80) return "Excellent!";
                if (percentage >= 60) return "Good job!";
                if (percentage >= 40) return "Not bad!";
                return "Keep learning!";
              })()}
            </div>

            {/* Feedback */}
            <div className="mb-8 text-gray-600 leading-relaxed">
              {(() => {
                const percentage = (score / questions.length) * 100;
                if (percentage >= 80) return "You're an environmental expert! Your knowledge of our planet is impressive.";
                if (percentage >= 60) return "You have solid environmental knowledge. Keep learning about our planet!";
                if (percentage >= 40) return "You know some environmental facts. There's always more to learn about our planet!";
                return "Everyone starts somewhere. This is a great opportunity to learn more about environmental issues!";
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={restartGame}
                className="bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:bg-green-800"
              >
                Play Again
              </button>
              <button
                onClick={quitGame}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700"
              >
                {onClose ? 'Close' : 'Quit'}
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default EcoQuiz;
