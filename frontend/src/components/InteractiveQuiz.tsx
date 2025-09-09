import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  ClockIcon,
  BoltIcon,
  FireIcon,
  TrophyIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  xpReward: number;
  timeLimit?: number;
  hint?: string;
  imageUrl?: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalXp: number;
  timeSpent: number;
  accuracy: number;
  streak: number;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  title: string;
  description?: string;
  onComplete: (result: QuizResult) => void;
  showTimer?: boolean;
  allowRetry?: boolean;
  showHints?: boolean;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  title,
  description,
  onComplete,
  showTimer = true,
  allowRetry = true,
  showHints = true
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (quizStarted && currentQuestion?.timeLimit && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion?.timeLimit && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, quizStarted, currentQuestion, showResult]);

  useEffect(() => {
    if (quizStarted && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 0);
      setQuestionStartTime(new Date());
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
      setAnimationKey(prev => prev + 1);
    }
  }, [currentQuestionIndex, quizStarted]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStreak(0);
    setTotalXp(0);
  };

  const handleTimeUp = () => {
    if (!selectedAnswer) {
      setSelectedAnswer('timeout');
      setShowExplanation(true);
      setTimeout(() => {
        if (isLastQuestion) {
          finishQuiz();
        } else {
          nextQuestion();
        }
      }, 2000);
    }
  };

  const selectAnswer = (optionId: string) => {
    if (selectedAnswer || showExplanation) return;
    
    setSelectedAnswer(optionId);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (selectedOption?.isCorrect) {
      setStreak(prev => prev + 1);
      const bonusXp = streak >= 3 ? Math.floor(currentQuestion.xpReward * 0.5) : 0;
      setTotalXp(prev => prev + currentQuestion.xpReward + bonusXp);
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    const correctAnswers = questions.filter(q => {
      const userAnswer = answers[q.id];
      return q.options.find(opt => opt.id === userAnswer)?.isCorrect;
    }).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;
    
    const result: QuizResult = {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      totalXp,
      timeSpent,
      accuracy: (correctAnswers / questions.length) * 100,
      streak
    };
    
    setShowResult(true);
    onComplete(result);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setStreak(0);
    setTotalXp(0);
    setStartTime(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <TrophyIcon className="h-16 w-16 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-lg opacity-90">{description}</p>}
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{questions.length}</div>
              <div className="text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {questions.reduce((sum, q) => sum + q.xpReward, 0)}
              </div>
              <div className="text-gray-600">Max XP</div>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <ClockIcon className="h-5 w-5" />
              <span>Average time: {Math.ceil(questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0) / 60)} minutes</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <LightBulbIcon className="h-5 w-5" />
              <span>Hints available for challenging questions</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <BoltIcon className="h-5 w-5" />
              <span>Bonus XP for answer streaks</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:from-green-700 hover:to-blue-700 transition-all"
          >
            <PlayIcon className="h-6 w-6" />
            Start Quiz
          </motion.button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const result = {
      score: Math.round((questions.filter(q => {
        const userAnswer = answers[q.id];
        return q.options.find(opt => opt.id === userAnswer)?.isCorrect;
      }).length / questions.length) * 100),
      correctAnswers: questions.filter(q => {
        const userAnswer = answers[q.id];
        return q.options.find(opt => opt.id === userAnswer)?.isCorrect;
      }).length,
      totalQuestions: questions.length
    };

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <TrophyIcon className="h-20 w-20 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-lg opacity-90">Great job on completing the quiz</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-gray-600">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{totalXp}</div>
              <div className="text-gray-600">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{streak}</div>
              <div className="text-gray-600">Best Streak</div>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            {result.score >= 90 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-800 font-semibold">🏆 Excellent Performance!</div>
                <div className="text-green-600">You've mastered this topic!</div>
              </div>
            )}
            {result.score >= 70 && result.score < 90 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-blue-800 font-semibold">👍 Good Job!</div>
                <div className="text-blue-600">You have a solid understanding</div>
              </div>
            )}
            {result.score < 70 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-yellow-800 font-semibold">📚 Keep Learning!</div>
                <div className="text-yellow-600">Review the material and try again</div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            {allowRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Try Again
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
            >
              Continue Learning
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="opacity-90">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <FireIcon className="h-4 w-4" />
                <span className="font-medium">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <BoltIcon className="h-4 w-4" />
              <span className="font-medium">{totalXp} XP</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <motion.div
            className="bg-white h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-8">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentQuestion.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  +{currentQuestion.xpReward} XP
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h3>
            </div>
            
            {showTimer && currentQuestion.timeLimit && (
              <div className="ml-6">
                <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                  {timeLeft}s
                </div>
                <div className="text-sm text-gray-600">Time left</div>
              </div>
            )}
          </div>

          {currentQuestion.imageUrl && (
            <div className="mb-6">
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-4 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.isCorrect;
              const showCorrectness = selectedAnswer && (isSelected || isCorrect);
              
              return (
                <motion.button
                  key={option.id}
                  whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                  whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                  onClick={() => selectAnswer(option.id)}
                  disabled={!!selectedAnswer}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    !selectedAnswer
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      : showCorrectness
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                        !selectedAnswer
                          ? 'border-gray-300 text-gray-600'
                          : showCorrectness
                          ? isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : isSelected
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-gray-300 text-gray-600'
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{option.text}</span>
                    </div>
                    
                    {showCorrectness && (
                      <div>
                        {isCorrect ? (
                          <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
                        ) : isSelected ? (
                          <XCircleIconSolid className="h-6 w-6 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  
                  {showExplanation && option.explanation && (isSelected || isCorrect) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600"
                    >
                      {option.explanation}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Hint */}
          {showHints && currentQuestion.hint && !selectedAnswer && (
            <div className="mb-6">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <LightBulbIcon className="h-5 w-5" />
                  Show Hint
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-2">
                    <LightBulbIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800 mb-1">Hint:</div>
                      <div className="text-yellow-700">{currentQuestion.hint}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Previous
            </button>
            
            {showExplanation && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={nextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
              >
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                <ArrowRightIcon className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveQuiz;
export type { QuizQuestion, QuizOption, QuizResult };

// Sample quiz data for environmental education
export const sampleEnvironmentalQuiz: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary cause of climate change?',
    options: [
      {
        id: 'a',
        text: 'Natural weather patterns',
        isCorrect: false,
        explanation: 'While natural patterns exist, they are not the primary driver of current climate change.'
      },
      {
        id: 'b',
        text: 'Greenhouse gas emissions from human activities',
        isCorrect: true,
        explanation: 'Human activities, especially burning fossil fuels, release greenhouse gases that trap heat in the atmosphere.'
      },
      {
        id: 'c',
        text: 'Solar radiation changes',
        isCorrect: false,
        explanation: 'Solar radiation changes occur naturally but are not the main cause of current climate change.'
      },
      {
        id: 'd',
        text: 'Ocean currents',
        isCorrect: false,
        explanation: 'Ocean currents are affected by climate change but are not the primary cause.'
      }
    ],
    explanation: 'The overwhelming scientific consensus is that human activities, particularly the emission of greenhouse gases from burning fossil fuels, are the primary driver of climate change since the mid-20th century.',
    difficulty: 'easy',
    category: 'Climate Change',
    xpReward: 50,
    timeLimit: 30,
    hint: 'Think about what humans have been doing more of since the Industrial Revolution.'
  },
  {
    id: 'q2',
    question: 'Which renewable energy source has the fastest growing capacity worldwide?',
    options: [
      {
        id: 'a',
        text: 'Hydroelectric power',
        isCorrect: false,
        explanation: 'While hydroelectric is important, it\'s not the fastest growing renewable source.'
      },
      {
        id: 'b',
        text: 'Wind power',
        isCorrect: false,
        explanation: 'Wind power is growing rapidly but not the fastest.'
      },
      {
        id: 'c',
        text: 'Solar power',
        isCorrect: true,
        explanation: 'Solar power has seen the most rapid growth in capacity additions globally in recent years.'
      },
      {
        id: 'd',
        text: 'Geothermal power',
        isCorrect: false,
        explanation: 'Geothermal is growing but at a much slower pace than solar.'
      }
    ],
    explanation: 'Solar power has experienced exponential growth due to rapidly declining costs and technological improvements, making it the fastest-growing renewable energy source globally.',
    difficulty: 'medium',
    category: 'Renewable Energy',
    xpReward: 75,
    timeLimit: 45,
    hint: 'Consider which technology has become much cheaper in recent years.'
  },
  {
    id: 'q3',
    question: 'What percentage of global greenhouse gas emissions come from the transportation sector?',
    options: [
      {
        id: 'a',
        text: 'About 14%',
        isCorrect: true,
        explanation: 'Transportation accounts for approximately 14% of global greenhouse gas emissions.'
      },
      {
        id: 'b',
        text: 'About 25%',
        isCorrect: false,
        explanation: 'This is higher than the actual percentage from transportation.'
      },
      {
        id: 'c',
        text: 'About 35%',
        isCorrect: false,
        explanation: 'This would be much higher than transportation\'s actual contribution.'
      },
      {
        id: 'd',
        text: 'About 5%',
        isCorrect: false,
        explanation: 'This is lower than transportation\'s actual contribution.'
      }
    ],
    explanation: 'According to the IPCC, transportation accounts for about 14% of global greenhouse gas emissions, making it a significant but not the largest contributor to climate change.',
    difficulty: 'hard',
    category: 'Climate Data',
    xpReward: 100,
    timeLimit: 60,
    hint: 'It\'s a significant contributor but not the largest sector.'
  }
];