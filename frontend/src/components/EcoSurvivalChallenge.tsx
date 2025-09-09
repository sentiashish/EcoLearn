import React, { useState } from 'react';

// Images for scenarios
const scenarioImages = [
  "https://bignanotech.com/wp-content/uploads/2024/10/05_Spill-170-scaled.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/7/71/Wolfsburg_VW-Werk.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Burnout_ops_on_Mangum_Fire_McCall_Smokejumpers.jpg/500px-Burnout_ops_on_Mangum_Fire_McCall_Smokejumpers.jpg",
  "https://cdn.shopify.com/s/files/1/1317/9597/files/Cebu_flowerpecker_Dicaeum_quadricolor_480x480.jpg?v=1623745246",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuzoexaQ5qn3YtQJgXP0kwGXvo3oo7TgCvFQ&s"
];

const allScenarios = [
  {
    text: "A local river has been contaminated by a small oil spill. What action do you take?",
    image: scenarioImages[0],
    choices: [
      { text: "Organize a cleanup crew and use eco-friendly absorbents.", outcome: { water: 20, health: 10, wildlife: 5 }, result: "The cleanup was successful! The water is much cleaner." },
      { text: "Ignore it and hope it disperses naturally.", outcome: { water: -30, wildlife: -20, health: -15 }, result: "The spill spread, harming the river and local fauna." },
      { text: "Install temporary barriers to contain the spill.", outcome: { water: 5, health: 0, wildlife: 0 }, result: "The barriers helped contain the spill temporarily, but a permanent solution is still needed." }
    ]
  },
  {
    text: "A major company wants to build a new factory on the edge of the forest. The factory would bring jobs but also pollution. What do you do?",
    image: scenarioImages[1],
    choices: [
      { text: "Negotiate with the company for strict environmental standards                                                                                                                                                                                         a smaller footprint.", outcome: { water: 5, health: 5, wildlife: 5 }, result: "You reached a compromise. The factory will be built, but with minimal environmental impact." },
      { text: "Accept the proposal as is to boost the local economy.", outcome: { water: -20, health: -20 }, result: "The factory's waste has started to pollute the air and water around the forest." },
      { text: "Organize protests to block the construction completely.", outcome: { water: 10, health: 10, wildlife: 10 }, result: "The protests succeeded in stopping the factory, preserving the forest but at the cost of local jobs." }
    ]
  },
  {
    text: "Forest fires have become more frequent due to climate change. What is your strategy for prevention?",
    image: scenarioImages[2],
    choices: [
      { text: "Invest in an early-detection drone system.", outcome: { health: 25 }, result: "The new drone system successfully detected a fire early and prevented a major disaster." },
      { text: "Increase patrols and fire breaks to manage the forest floor.", outcome: { health: 15 }, result: "The preventative measures reduced the risk of a fire, and the forest is safer." },
      { text: "Focus on public education about fire prevention.", outcome: { health: 10 }, result: "Education helped reduce human-caused fires, but natural fires remain a risk." }
    ]
  },
  {
    text: "A rare species of bird has been sighted, but its habitat is threatened by deforestation. What do you do?",
    image: scenarioImages[3],
    choices: [
      { text: "Create a wildlife sanctuary to protect its habitat.", outcome: { wildlife: 25, health: 10 }, result: "The new sanctuary provides a safe haven for the rare bird and other species." },
      { text: "Allow limited logging to fund conservation efforts.", outcome: { health: -10, wildlife: -10 }, result: "The logging caused more harm than good, and the bird's population is at risk." },
      { text: "Relocate the birds to a safer area.", outcome: { wildlife: 5, health: 0 }, result: "Some birds were successfully relocated, but the process was stressful for the population." }
    ]
  },
  {
    text: "A severe drought is hitting the region. What is your response?",
    image: scenarioImages[4],
    choices: [
      { text: "Implement a water conservation plan and build a new well.", outcome: { water: 25, health: 10 }, result: "The conservation efforts helped the forest survive the drought with minimal damage." },
      { text: "Do nothing and hope for rain.", outcome: { water: -30, health: -20, wildlife: -15 }, result: "The drought severely impacted the forest, causing widespread plant and animal loss." },
      { text: "Divert water from a nearby source temporarily.", outcome: { water: 15, health: 5, wildlife: -5 }, result: "The diversion helped but affected the ecosystem where the water was taken from." }
    ]
  }
];

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const EcoSurvivalChallenge: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [stats, setStats] = useState({ health: 100, water: 100, wildlife: 100 });
  const [currentRound, setCurrentRound] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState<'win' | 'lose'>('win');
  const [selectedScenarios, setSelectedScenarios] = useState(() => {
    let scenarios = shuffleArray([...allScenarios]).slice(0, 5);
    return scenarios.map(s => ({ ...s, choices: shuffleArray([...s.choices]) }));
  });

  const handleChoice = (choice: any) => {
    const newStats = { ...stats };
    newStats.health += choice.outcome.health || 0;
    newStats.water += choice.outcome.water || 0;
    newStats.wildlife += choice.outcome.wildlife || 0;
    for (const key in newStats) {
      newStats[key] = Math.max(0, Math.min(100, newStats[key]));
    }
    setStats(newStats);
    if (newStats.health <= 0 || newStats.water <= 0 || newStats.wildlife <= 0) {
      setGameStatus('lose');
      setShowGameOver(true);
      return;
    }
    setTimeout(() => {
      if (currentRound + 1 < selectedScenarios.length) {
        setCurrentRound(currentRound + 1);
      } else {
        setGameStatus('win');
        setShowGameOver(true);
      }
    }, 1200);
  };

  const restartGame = () => {
    setStats({ health: 100, water: 100, wildlife: 100 });
    setCurrentRound(0);
    setShowGameOver(false);
    setGameStatus('win');
    let scenarios = shuffleArray([...allScenarios]).slice(0, 5);
    setSelectedScenarios(scenarios.map(s => ({ ...s, choices: shuffleArray([...s.choices]) })));
  };

  const scenario = selectedScenarios[currentRound];

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#142720] rounded-2xl shadow-2xl p-8 mt-8 text-[#F5F8F6] relative">
      <div className="flex justify-between items-center pb-4 border-b border-[#3E514B]">
        <h1 className="text-2xl font-bold text-[#45B649]">Eco-Survival Challenge</h1>
        <span className="text-lg">Day {currentRound + 1}</span>
      </div>
      <div className="flex justify-between gap-4 my-6">
        <div className="flex-1 text-center">
          <span className="text-sm">🌲 Forest Health</span>
          <div className="w-full bg-[#3E514B] rounded-full h-2 mt-1">
            <div style={{ width: `${stats.health}%`, backgroundColor: stats.health > 50 ? '#45B649' : stats.health > 25 ? '#eab308' : '#dc2626' }} className="h-2 rounded-full transition-all duration-500"></div>
          </div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm">💧 Water Purity</span>
          <div className="w-full bg-[#3E514B] rounded-full h-2 mt-1">
            <div style={{ width: `${stats.water}%`, backgroundColor: stats.water > 50 ? '#45B649' : stats.water > 25 ? '#eab308' : '#dc2626' }} className="h-2 rounded-full transition-all duration-500"></div>
          </div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm">🐾 Wildlife Population</span>
          <div className="w-full bg-[#3E514B] rounded-full h-2 mt-1">
            <div style={{ width: `${stats.wildlife}%`, backgroundColor: stats.wildlife > 50 ? '#45B649' : stats.wildlife > 25 ? '#eab308' : '#dc2626' }} className="h-2 rounded-full transition-all duration-500"></div>
          </div>
        </div>
      </div>
      <div className="my-6">
        <div className="max-w-xl mx-auto rounded-xl overflow-hidden mb-4">
          <img src={scenario.image} alt="Eco Challenge" className="w-full h-64 object-cover" />
        </div>
        <p className="text-lg mb-6 text-center animate-fadeIn">{scenario.text}</p>
        <div className="flex flex-col gap-4">
          {scenario.choices.map((choice: any, idx: number) => (
            <button key={idx} className="choice-button bg-[#1F362C] p-4 rounded-xl border-2 border-[#3E514B] hover:bg-[#2e4a3c] text-left text-[#F5F8F6]" onClick={() => handleChoice(choice)}>
              {choice.text}
            </button>
          ))}
        </div>
      </div>
      {showGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#142720] p-8 rounded-2xl text-center max-w-lg w-full shadow-2xl">
            <h2 className={`text-3xl font-bold ${gameStatus === 'win' ? 'text-[#45B649]' : 'text-red-500'}`}>{gameStatus === 'win' ? 'You Saved the Forest! 🎉' : 'The Forest Perished... 😢'}</h2>
            <p className="text-lg text-[#D4DCD7] mt-4">{gameStatus === 'win' ? 'Your wise decisions ensured the forest thrived and prospered.' : 'Your decisions had a devastating impact. The forest could not recover.'}</p>
            <p className="text-2xl font-bold mt-4">Final Stats:</p>
            <ul className="list-disc list-inside mt-2 text-left mx-auto max-w-xs">
              <li>🌲 Forest Health: {stats.health}%</li>
              <li>💧 Water Purity: {stats.water}%</li>
              <li>🐾 Wildlife Population: {stats.wildlife}%</li>
            </ul>
            <button className={`eco-button mt-8 px-6 py-2 rounded-full font-bold ${gameStatus === 'win' ? '' : 'lose-button'}`} onClick={restartGame}>Play Again</button>
            {onClose && <button className="mt-4 text-gray-400 hover:text-gray-600 block mx-auto" onClick={onClose}>Close</button>}
          </div>
        </div>
      )}
      {onClose && <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>}
    </div>
  );
};

export default EcoSurvivalChallenge;
