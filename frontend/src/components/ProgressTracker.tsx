import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  TrophyIcon,
  StarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  AcademicCapIcon,
  BeakerIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
  SparklesIcon as SunIcon,
  BeakerIcon as WaterDropIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  level: number;
  maxLevel: number;
  xpRequired: number;
  currentXp: number;
  unlocked: boolean;
  completed: boolean;
  prerequisites: string[];
  rewards: {
    xp: number;
    badges?: string[];
    unlocks?: string[];
  };
  category: 'climate' | 'energy' | 'conservation' | 'pollution' | 'sustainability';
  position: { x: number; y: number };
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  totalModules: number;
  completedModules: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  skills: string[];
  nextMilestone: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: string;
}

interface ProgressTrackerProps {
  skillTree: SkillNode[];
  learningPaths: LearningPath[];
  achievements: Achievement[];
  userLevel: number;
  totalXp: number;
  weeklyGoal: number;
  weeklyProgress: number;
  onSkillSelect?: (skill: SkillNode) => void;
  onPathSelect?: (path: LearningPath) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  skillTree,
  learningPaths,
  achievements,
  userLevel,
  totalXp,
  weeklyGoal,
  weeklyProgress,
  onSkillSelect,
  onPathSelect
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'paths' | 'achievements'>('overview');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'climate': return 'from-blue-500 to-cyan-500';
      case 'energy': return 'from-yellow-500 to-orange-500';
      case 'conservation': return 'from-green-500 to-emerald-500';
      case 'pollution': return 'from-red-500 to-pink-500';
      case 'sustainability': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getSkillProgress = (skill: SkillNode) => {
    return (skill.currentXp / skill.xpRequired) * 100;
  };

  const isSkillUnlockable = (skill: SkillNode) => {
    return skill.prerequisites.every(prereqId => 
      skillTree.find(s => s.id === prereqId)?.completed
    );
  };

  const triggerCelebration = (achievement: Achievement) => {
    setShowCelebration(achievement);
    setTimeout(() => setShowCelebration(null), 3000);
  };

  const SkillTreeView = () => (
    <div className="relative">
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 min-h-[600px] overflow-hidden">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Environmental Skills Tree</h3>
        
        {/* Skill Nodes */}
        <div className="relative">
          {skillTree.map((skill) => {
            const isUnlockable = isSkillUnlockable(skill);
            const progress = getSkillProgress(skill);
            
            return (
              <motion.div
                key={skill.id}
                className="absolute"
                style={{
                  left: `${skill.position.x}%`,
                  top: `${skill.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.1 }}
                onHoverStart={() => setHoveredSkill(skill.id)}
                onHoverEnd={() => setHoveredSkill(null)}
              >
                <motion.button
                  onClick={() => {
                    setSelectedSkill(skill);
                    onSkillSelect?.(skill);
                  }}
                  className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                    skill.completed
                      ? 'border-green-500 bg-green-100'
                      : skill.unlocked
                      ? `border-blue-500 bg-gradient-to-r ${getCategoryColor(skill.category)}`
                      : isUnlockable
                      ? 'border-yellow-500 bg-yellow-100'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                  disabled={!skill.unlocked && !isUnlockable}
                >
                  {skill.completed ? (
                    <CheckCircleIconSolid className="h-8 w-8 text-green-600" />
                  ) : skill.unlocked ? (
                    <skill.icon className="h-8 w-8 text-white" />
                  ) : isUnlockable ? (
                    <skill.icon className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <LockClosedIcon className="h-8 w-8 text-gray-400" />
                  )}
                  
                  {/* Progress Ring */}
                  {skill.unlocked && !skill.completed && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="36"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="36"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                  )}
                  
                  {/* Level Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                    {skill.level}
                  </div>
                </motion.button>
                
                {/* Skill Name */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {skill.name}
                  </div>
                  {skill.unlocked && !skill.completed && (
                    <div className="text-xs text-gray-600">
                      {skill.currentXp}/{skill.xpRequired} XP
                    </div>
                  )}
                </div>
                
                {/* Hover Tooltip */}
                <AnimatePresence>
                  {hoveredSkill === skill.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 border z-10 w-64"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{skill.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Level:</span>
                          <span className="font-medium">{skill.level}/{skill.maxLevel}</span>
                        </div>
                        {skill.unlocked && !skill.completed && (
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Reward:</span>
                          <span className="font-medium text-green-600">+{skill.rewards.xp} XP</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {skillTree.map((skill) =>
              skill.prerequisites.map((prereqId) => {
                const prereq = skillTree.find(s => s.id === prereqId);
                if (!prereq) return null;
                
                return (
                  <line
                    key={`${prereqId}-${skill.id}`}
                    x1={`${prereq.position.x}%`}
                    y1={`${prereq.position.y}%`}
                    x2={`${skill.position.x}%`}
                    y2={`${skill.position.y}%`}
                    stroke={prereq.completed ? '#10b981' : '#d1d5db'}
                    strokeWidth="2"
                    strokeDasharray={prereq.completed ? '0' : '5,5'}
                  />
                );
              })
            )}
          </svg>
        </div>
      </div>
      
      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getCategoryColor(selectedSkill.category)} flex items-center justify-center`}>
                  <selectedSkill.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSkill.name}</h3>
                  <p className="text-gray-600">Level {selectedSkill.level}/{selectedSkill.maxLevel}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedSkill.description}</p>
              
              {selectedSkill.unlocked && !selectedSkill.completed && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{selectedSkill.currentXp}/{selectedSkill.xpRequired} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(selectedSkill.category)}`}
                      style={{ width: `${getSkillProgress(selectedSkill)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reward:</span>
                  <span className="font-medium text-green-600">+{selectedSkill.rewards.xp} XP</span>
                </div>
                
                {selectedSkill.prerequisites.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-2">Prerequisites:</span>
                    <div className="space-y-1">
                      {selectedSkill.prerequisites.map((prereqId) => {
                        const prereq = skillTree.find(s => s.id === prereqId);
                        return prereq ? (
                          <div key={prereqId} className="flex items-center gap-2">
                            {prereq.completed ? (
                              <CheckCircleIconSolid className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                            )}
                            <span className={prereq.completed ? 'text-green-600' : 'text-gray-500'}>
                              {prereq.name}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedSkill(null)}
                className="w-full mt-6 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Learning Progress</h2>
            <p className="text-lg opacity-90">Level {userLevel} • {totalXp.toLocaleString()} XP</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round((weeklyProgress / weeklyGoal) * 100)}%</div>
            <div className="text-sm opacity-90">Weekly Goal</div>
          </div>
        </div>
        
        {/* Weekly Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>This Week's Progress</span>
            <span>{weeklyProgress} / {weeklyGoal} XP</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <motion.div
              className="bg-white h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'skills', label: 'Skills Tree', icon: AcademicCapIcon },
            { id: 'paths', label: 'Learning Paths', icon: BeakerIcon },
            { id: 'achievements', label: 'Achievements', icon: TrophyIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {skillTree.filter(s => s.completed).length}
                </div>
                <div className="text-sm text-gray-600">Skills Mastered</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {learningPaths.reduce((sum, path) => sum + path.completedModules, 0)}
                </div>
                <div className="text-sm text-gray-600">Modules Completed</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {achievements.filter(a => a.unlocked).length}
                </div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length)}
                </div>
                <div className="text-sm text-gray-600">Avg Progress %</div>
              </div>
            </div>

            {/* Current Learning Paths */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Learning Paths</h3>
              <div className="space-y-4">
                {learningPaths.slice(0, 3).map((path) => (
                  <div key={path.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{path.name}</h4>
                        <p className="text-sm text-gray-600">{path.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{path.completedModules}/{path.totalModules} modules</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Next: {path.nextMilestone}</span>
                      <span>{path.estimatedTime} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements
                  .filter(a => a.unlocked)
                  .slice(0, 4)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} flex items-center justify-center text-xl`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                        <div className={`text-xs font-medium capitalize ${
                          achievement.rarity === 'legendary' ? 'text-yellow-600' :
                          achievement.rarity === 'epic' ? 'text-purple-600' :
                          achievement.rarity === 'rare' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {achievement.rarity}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'skills' && <SkillTreeView />}

        {selectedTab === 'paths' && (
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <motion.div
                key={path.id}
                whileHover={{ scale: 1.02 }}
                className="border rounded-lg p-6 cursor-pointer hover:shadow-md transition-all"
                onClick={() => onPathSelect?.(path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.name}</h3>
                    <p className="text-gray-600 mb-3">{path.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {path.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <AcademicCapIcon className="h-4 w-4" />
                        {path.totalModules} modules
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{Math.round(path.progress)}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{path.completedModules}/{path.totalModules} modules</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${path.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {path.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                    {path.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{path.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Next: {path.nextMilestone}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} flex items-center justify-center text-2xl`}>
                    {achievement.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{achievement.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  <div className={`text-xs font-medium capitalize mb-3 ${
                    achievement.rarity === 'legendary' ? 'text-yellow-600' :
                    achievement.rarity === 'epic' ? 'text-purple-600' :
                    achievement.rarity === 'rare' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {achievement.rarity}
                  </div>
                  
                  {!achievement.unlocked && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {achievement.progress} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-green-600">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {achievement.unlocked && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircleIconSolid className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{showCelebration.icon}</div>
              <div>
                <div className="font-bold text-lg">Achievement Unlocked!</div>
                <div className="text-sm opacity-90">{showCelebration.name}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressTracker;
export type { SkillNode, LearningPath, Achievement };

// Sample data for environmental education
export const sampleSkillTree: SkillNode[] = [
  {
    id: 'climate-basics',
    name: 'Climate Basics',
    description: 'Understanding fundamental climate science concepts',
    icon: GlobeAltIcon,
    level: 1,
    maxLevel: 5,
    xpRequired: 100,
    currentXp: 100,
    unlocked: true,
    completed: true,
    prerequisites: [],
    rewards: { xp: 100, badges: ['climate-novice'] },
    category: 'climate',
    position: { x: 20, y: 30 }
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    description: 'Learn about solar, wind, and other renewable energy sources',
    icon: SunIcon,
    level: 1,
    maxLevel: 5,
    xpRequired: 150,
    currentXp: 75,
    unlocked: true,
    completed: false,
    prerequisites: ['climate-basics'],
    rewards: { xp: 150, badges: ['energy-explorer'] },
    category: 'energy',
    position: { x: 50, y: 20 }
  },
  {
    id: 'water-conservation',
    name: 'Water Conservation',
    description: 'Strategies for protecting and conserving water resources',
    icon: WaterDropIcon,
    level: 1,
    maxLevel: 5,
    xpRequired: 120,
    currentXp: 0,
    unlocked: true,
    completed: false,
    prerequisites: ['climate-basics'],
    rewards: { xp: 120, badges: ['water-guardian'] },
    category: 'conservation',
    position: { x: 20, y: 60 }
  },
  {
    id: 'sustainable-living',
    name: 'Sustainable Living',
    description: 'Practical approaches to sustainable lifestyle choices',
    icon: PuzzlePieceIcon,
    level: 1,
    maxLevel: 5,
    xpRequired: 200,
    currentXp: 0,
    unlocked: false,
    completed: false,
    prerequisites: ['renewable-energy', 'water-conservation'],
    rewards: { xp: 200, badges: ['eco-champion'] },
    category: 'sustainability',
    position: { x: 80, y: 40 }
  }
];

export const sampleLearningPaths: LearningPath[] = [
  {
    id: 'climate-science',
    name: 'Climate Science Fundamentals',
    description: 'Master the science behind climate change and global warming',
    totalModules: 8,
    completedModules: 5,
    estimatedTime: '2 weeks',
    difficulty: 'beginner',
    progress: 62.5,
    skills: ['Climate Basics', 'Greenhouse Effect', 'Carbon Cycle'],
    nextMilestone: 'Atmospheric Chemistry'
  },
  {
    id: 'renewable-energy-systems',
    name: 'Renewable Energy Systems',
    description: 'Explore different renewable energy technologies and their applications',
    totalModules: 12,
    completedModules: 3,
    estimatedTime: '3 weeks',
    difficulty: 'intermediate',
    progress: 25,
    skills: ['Solar Power', 'Wind Energy', 'Energy Storage'],
    nextMilestone: 'Grid Integration'
  }
];

export const sampleAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    name: 'First Steps',
    description: 'Complete your first environmental lesson',
    icon: '🌱',
    rarity: 'common',
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    progress: 1,
    maxProgress: 1,
    category: 'Learning'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: '🧠',
    rarity: 'rare',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    category: 'Assessment'
  },
  {
    id: 'eco-champion',
    name: 'Eco Champion',
    description: 'Complete all sustainability modules',
    icon: '🏆',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'Mastery'
  }
];