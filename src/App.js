import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Dices, Shield, Anchor, Lightbulb, Sparkles } from 'lucide-react';

const TEAM_COLORS = {
  Athens: "#2F7FDB", Sparta: "#C23B22", Corinth: "#2E8B57",
  Thebes: "#8B5CF6", Argos: "#FF8C00"
};

const TEAM_SEA_COLORS = {
  Athens: "#87CEEB", Sparta: "#F08080", Corinth: "#90EE90",
  Thebes: "#C4B5FD", Argos: "#FFD39B"
};

const LAND_VP = 2, SEA_VP = 1;
const SCIENCE_PER_BUFF = 8, CULTURE_PER_BUFF = 10;

const CITYSTATE_BLURBS = {
  Athens: "Democracy/Philosophy: +1 Science & +1 Culture per roll",
  Sparta: "Military: Starts d6 Conquer (others d4), can reach d8",
  Corinth: "Naval: Starts with Sailing unlocked",
  Thebes: "Tactics: Reroll Conquer once, keep higher",
  Argos: "Culture: +2 Culture per Culture roll"
};

const DEFAULT_MAP = [
  ['L','L','L','L','L','L','L','L','L','L','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','L','L','W','W'],
  ['W','L','L','L','L','L','L','L','L','L','L','L','W','W','L','W','W','W','W','W','W','W','W','W','W','W','W','W','L','L','W'],
  ['W','W','L','L','L','L','L','L','L','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','L','L','L','L','L','L','L','L','L','W','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','L','L','L','L','L','L','L','L','L','L','W','W','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','L','W'],
  ['W','L','W','W','L','L','L','L','L','L','L','L','L','L','W','W','L','L','L','W','W','W','W','W','W','W','W','W','W','W','L'],
  ['W','W','W','W','L','L','L','L','L','L','L','L','L','L','L','L','W','L','L','W','W','W','W','W','W','W','W','W','W','L','L'],
  ['L','L','W','W','W','W','W','W','W','W','W','W','L','L','L','T','L','L','W','L','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','L','W','W','W','L','L','L','L','L','L','L','W','L','L','L','L','L','W','W','L','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','L','L','L','L','L','L','L','L','L','C','W','W','W','A','W','W','W','W','L','W','W','W','W','W','W','W','W'],
  ['W','W','L','W','L','L','L','L','L','L','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','L','L','L','L','L','L','R','L','L','L','W','W','W','W','W','W','W','W','L','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','L','L','L','L','L','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','L','L','L','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','L','L','L','L','S','L','L','W','W','W','W','W','W','W','W','W','W','W','W','L','W','W','W','W','W'],
  ['W','W','W','W','W','W','L','L','W','W','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','L','W','W','L','L','L','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','L','W','W','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','L','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','L','L','L','L','L','L','L','L','W','L','L','L','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','L','L','L','L','L','L','W','W','W']
];

const roll = (sides) => Math.floor(Math.random() * sides) + 1;

const RulesPage = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Game Rules</h2>
          <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="text-xl font-bold mb-2">1. Overview</h3>
            <p><strong>Struggle of the Poleis</strong> is a competitive territory-control game set in ancient Greece. Each player leads a powerful <strong>city-state (polis)</strong> vying for dominance through <strong>conquest, expansion, science, and culture</strong>.</p>
            <p className="mt-2">Players take turns rolling dice, gaining resources, claiming land and sea hexes, and unlocking buffs that represent their civilization's advancements.</p>
            <p className="mt-2"><strong>Victory Points (VP)</strong> determine the winner. The game ends when a round threshold is met or when a player achieves a predetermined VP target.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">2. Setup</h3>
            <h4 className="font-semibold mt-2">Select City-States</h4>
            <p>Each player chooses one of the following:</p>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li><strong>Athens (Democracy / Philosophy):</strong> +1 Science per Science roll; +1 Culture per Culture roll.</li>
              <li><strong>Sparta (Military):</strong> Starts with Conquer d6 (others start d4). Can upgrade to d8 with buff.</li>
              <li><strong>Corinth (Naval):</strong> Starts with Sailing. May claim & conquer sea hexes immediately.</li>
              <li><strong>Thebes (Tactics):</strong> May reroll Conquer once per roll and keep the higher.</li>
              <li><strong>Argos (Cultural):</strong> +2 Culture on every Culture roll.</li>
            </ul>
            
            <h4 className="font-semibold mt-3">Claim Capitals</h4>
            <p>Each chosen city-state begins with its <strong>capital hex</strong> controlled.</p>
            
            <h4 className="font-semibold mt-3">Turn Order</h4>
            <p>Play always proceeds in this order: <strong>Athens → Sparta → Corinth → Thebes → Argos</strong></p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">3. Turn Structure</h3>
            <p>On a player's turn:</p>
            <ol className="list-decimal ml-6 mt-1 space-y-1">
              <li><strong>Choose a Die Action</strong> (automatic roll):
                <ul className="list-disc ml-6 mt-1">
                  <li><strong>Conquer (d4/d6/d8):</strong> Attack and capture adjacent enemy hexes.</li>
                  <li><strong>Expand (d6):</strong> Claim unowned adjacent land hexes.</li>
                  <li><strong>Sail (d8):</strong> Claim unowned adjacent sea hexes (requires Sailing).</li>
                  <li><strong>Science (d12):</strong> Generate Science points to unlock Science buffs.</li>
                  <li><strong>Culture (d20):</strong> Generate Culture points to unlock Culture buffs.</li>
                </ul>
              </li>
              <li><strong>Apply Action Points</strong> by claiming hexes or applying results.</li>
              <li><strong>End Turn.</strong> Click <strong>"End Turn"</strong> to pass play to the next player.</li>
            </ol>
            <p className="mt-2"><strong>Note:</strong> Each player may roll only <strong>one die per turn</strong>. However, the UI allows continuing actions until "End Turn" is clicked for flexibility.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">4. Resources</h3>
            <h4 className="font-semibold">Science Points</h4>
            <ul className="list-disc ml-6 mt-1">
              <li>Earned via <strong>Science rolls (d12)</strong>.</li>
              <li>Every <strong>8 Science</strong> unlocks a <strong>Science Buff</strong>.</li>
            </ul>
            
            <h4 className="font-semibold mt-2">Culture Points</h4>
            <ul className="list-disc ml-6 mt-1">
              <li>Earned via <strong>Culture rolls (d20)</strong>.</li>
              <li>Every <strong>10 Culture</strong> unlocks a <strong>Culture Buff</strong>.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">5. Buffs</h3>
            <h4 className="font-semibold">Science Buffs</h4>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li><strong>Sailing:</strong> May claim and conquer sea hexes.</li>
              <li><strong>Stronger Military:</strong> Upgrade Conquer die (d4 → d6; Sparta d6 → d8).</li>
              <li><strong>Scholarship:</strong> May reroll Science once per roll.</li>
              <li><strong>Infrastructure:</strong> +0.25 VP per land hex each turn.</li>
              <li><strong>Siegecraft:</strong> +1 roll to Conquer results (extra actions).</li>
            </ul>
            
            <h4 className="font-semibold mt-2">Culture Buffs</h4>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li><strong>Diplomacy:</strong> Gain immunity from conquest for 3 turns (stackable). While immune, you cannot attack other nations.</li>
              <li><strong>Golden Age:</strong> Permanent VP bonus: +1 VP per 20 Culture.</li>
              <li><strong>Tourism & Trade:</strong> Gain +0.5 VP per sea hex each turn.</li>
              <li><strong>Assimilation:</strong> +1 Culture each time you conquer a hex.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">6. Combat & Conquest</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Conquer:</strong> Attack adjacent enemy hexes.</li>
              <li><strong>Sailing Requirement:</strong> You must have Sailing to capture or conquer sea hexes.</li>
              <li><strong>Capital Protection:</strong> Capitals cannot be conquered during the first 4 full rounds.</li>
              <li><strong>Diplomacy Immunity:</strong> A city-state with active immunity cannot be attacked <strong>and</strong> cannot launch conquests.</li>
              <li><strong>Capital Bonus:</strong> Capturing <strong>any capital hex</strong> grants <strong>+10 VP</strong> to the conqueror. This includes retaking your own capital or stealing another's.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">7. Revolt Mode</h3>
            <p>If a city-state loses <strong>all of its land hexes</strong>, it:</p>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li>Immediately loses control of <strong>all sea hexes</strong>.</li>
              <li>Enters <strong>Revolt Mode</strong>.</li>
              <li>On its turn, may only roll a <strong>Revolt Conquer (d4)</strong>:
                <ul className="list-disc ml-6 mt-1">
                  <li><strong>1–2:</strong> Revolt fails. Nothing happens.</li>
                  <li><strong>3–4:</strong> The capital is restored under that city-state's control. Gain <strong>+10 VP</strong> and <strong>2 turns of Diplomacy immunity</strong> (starting the next turn).</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">8. Victory Points (VP)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Land Hexes:</strong> 2 VP each.</li>
              <li><strong>Sea Hexes:</strong> 1 VP each.</li>
              <li><strong>Science:</strong> 1 VP per 2 Science points (½ VP per point).</li>
              <li><strong>Culture:</strong> 1 VP per 4 Culture points (¼ VP per point).</li>
              <li><strong>Port City Holder:</strong> +10 VP if you have the most sea hexes (≥6, no tie).</li>
              <li><strong>Miscellaneous:</strong> Infrastructure bonuses, Golden Age bonuses, capital capture bonuses.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">9. Winning</h3>
            <p>The game ends when:</p>
            <ul className="list-disc ml-6 mt-1">
              <li>A set number of rounds are completed (e.g., 12–15 rounds), <strong>or</strong></li>
              <li>A player reaches a VP threshold (e.g., 100 VP).</li>
            </ul>
            <p className="mt-2">The player with the <strong>highest total VP</strong> at the end of the game wins.</p>
          </section>
        </div>
        
        <button onClick={onClose} className="mt-6 w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
          Close Rules
        </button>
      </div>
    </div>
  );
};

const TeamPicker = ({ onStart, onShowRules }) => {
  const [selected, setSelected] = useState(['Athens', 'Sparta', 'Corinth']);
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select City-States</h2>
          <button 
            onClick={onShowRules}
            className="bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700"
          >
            Rules
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <h3 className="font-semibold mb-2">City-State Traits:</h3>
          {Object.entries(CITYSTATE_BLURBS).map(([name, desc]) => (
            <div key={name} className="text-sm mb-1">
              <span className="font-medium">{name}:</span> {desc}
            </div>
          ))}
        </div>
        
        <div className="space-y-2 mb-6">
          {['Athens', 'Sparta', 'Corinth', 'Thebes', 'Argos'].map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selected.includes(t)}
                onChange={() => {
                  setSelected(prev => 
                    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                  );
                }}
                className="w-4 h-4"
              />
              <span className="font-medium">{t}</span>
            </label>
          ))}
        </div>
        
        <button 
          onClick={() => selected.length > 0 && onStart(selected)}
          disabled={selected.length === 0}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

const BuffPicker = ({ team, type, player, onApply, onDefer }) => {
  const scienceOpts = [];
  if (!player.canSail) scienceOpts.push({id: 'sail', label: 'Sailing', desc: 'Claim & conquer sea hexes'});
  if (player.conquerDie === 4 || (team === 'Sparta' && player.conquerDie === 6)) 
    scienceOpts.push({id: 'military', label: 'Stronger Military', desc: 'Upgrade conquer die'});
  if (!player.scholarship) scienceOpts.push({id: 'scholar', label: 'Scholarship', desc: 'Reroll Science once'});
  if (!player.infrastructure) scienceOpts.push({id: 'infra', label: 'Infrastructure', desc: '+0.25 VP per land/turn'});
  if (!player.siegecraft) scienceOpts.push({id: 'siege', label: 'Siegecraft', desc: '+1 to conquer rolls'});
  
  const cultureOpts = [
    {id: 'diplo', label: 'Diplomacy', desc: '+3 turns immunity (stackable)'},
  ];
  if (!player.goldenAge) cultureOpts.push({id: 'golden', label: 'Golden Age', desc: '+1 VP per 20 culture'});
  if (!player.tourism) cultureOpts.push({id: 'tourism', label: 'Tourism & Trade', desc: '+0.5 VP per sea/turn'});
  if (!player.assimilation) cultureOpts.push({id: 'assim', label: 'Assimilation', desc: '+1 culture per conquest'});
  
  const opts = type === 'science' ? scienceOpts : cultureOpts;
  const [choice, setChoice] = useState(opts[0]?.id);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">{team}: Choose {type} Buff</h3>
        
        <div className="space-y-2 mb-4">
          {opts.map(opt => (
            <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
              <input 
                type="radio" 
                value={opt.id}
                checked={choice === opt.id}
                onChange={() => setChoice(opt.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-sm text-gray-600">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => onApply(choice)} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold">
            Apply
          </button>
          <button onClick={onDefer} className="px-4 bg-gray-300 rounded">
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const canvasRef = useRef(null);

  const initGame = (selectedTeams) => {
    const newMap = DEFAULT_MAP.map((row, r) => 
      row.map((cell, c) => {
        const isLand = ['L','A','S','C','T','R'].includes(cell);
        let capital = null;
        if (cell === 'A') capital = 'Athens';
        if (cell === 'S') capital = 'Sparta';
        if (cell === 'C') capital = 'Corinth';
        if (cell === 'T') capital = 'Thebes';
        if (cell === 'R') capital = 'Argos';
        
        let owner = null;
        if (capital && selectedTeams.includes(capital)) owner = capital;
        
        return { col: c, row: r, isLand, capital, owner };
      })
    );

    const newPlayers = {};
    selectedTeams.forEach(t => {
      newPlayers[t] = {
        name: t,
        science: 0, culture: 0,
        conquerDie: t === 'Sparta' ? 6 : 4,
        canSail: t === 'Corinth',
        inRevolt: false,
        diplomacyImmunity: 0,
        scholarship: false, infrastructure: false, siegecraft: false,
        tourism: false, assimilation: false, goldenAge: false, goldenAgeGranted: 0,
        athensPassive: t === 'Athens',
        thebesReroll: t === 'Thebes',
        argosPlus2: t === 'Argos',
        sciTokens: 0, culTokens: 0,
        miscVP: 0,
        actions: {conquer: 0, expand: 0, sail: 0}
      };
    });

    setGameState({
      map: newMap,
      players: newPlayers,
      teams: selectedTeams,
      turnIdx: 0,
      globalTurn: 0,
      mode: 'Idle',
      status: 'Welcome! Roll dice to begin.',
      portCity: null,
      buffPicker: null
    });
  };

  useEffect(() => {
    if (gameState) {
      drawCanvas();
      updatePortCity();
    }
  }, [gameState]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState || gameState.map.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const R = 20;
    const dx = 1.5 * R;
    const dy = Math.sqrt(3) * R;
    
    canvas.width = gameState.map[0].length * dx + R + 40;
    canvas.height = gameState.map.length * dy + R + 40;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    gameState.map.forEach(row => {
      row.forEach(cell => {
        const cx = 20 + R + cell.col * dx;
        const cy = 20 + R + cell.row * dy + (cell.col % 2 === 1 ? dy/2 : 0);
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI/3 * i;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        if (cell.owner) {
          ctx.fillStyle = cell.isLand ? TEAM_COLORS[cell.owner] : TEAM_SEA_COLORS[cell.owner];
        } else {
          ctx.fillStyle = cell.isLand ? '#F9F6EE' : '#D7EEF7';
        }
        ctx.fill();
        ctx.strokeStyle = '#9AA6B2';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        if (cell.capital && gameState.teams.includes(cell.capital)) {
          // Draw white circle background for contrast
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw star on top
          ctx.fillStyle = TEAM_COLORS[cell.capital];
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', cx, cy);
        }
      });
    });
  };

  const updatePortCity = () => {
    if (!gameState) return;
    
    const counts = {};
    gameState.teams.forEach(t => {
      counts[t] = gameState.map.flat().filter(c => c.owner === t && !c.isLand).length;
    });
    
    const maxSea = Math.max(...Object.values(counts));
    const leaders = Object.keys(counts).filter(t => counts[t] === maxSea);
    const newPort = maxSea >= 6 && leaders.length === 1 ? leaders[0] : null;
    
    if (newPort !== gameState.portCity) {
      setGameState(prev => ({...prev, portCity: newPort}));
    }
  };

  const getCell = (col, row) => {
    if (!gameState || row < 0 || row >= gameState.map.length || col < 0 || col >= gameState.map[0].length) {
      return null;
    }
    return gameState.map[row][col];
  };

  const neighbors = (col, row) => {
    const deltas = col % 2 === 0 
      ? [[-1,-1], [0,-1], [1,-1], [1,0], [0,1], [-1,0]]
      : [[-1,0], [0,-1], [1,0], [1,1], [0,1], [-1,1]];
    
    return deltas.map(([dc, dr]) => [col+dc, row+dr])
      .filter(([c, r]) => getCell(c, r));
  };

  const isAdjacent = (cell, team) => {
    return neighbors(cell.col, cell.row).some(([c, r]) => {
      const n = getCell(c, r);
      return n && n.owner === team;
    });
  };

  const countHexes = (team, isLand) => {
    if (!gameState) return 0;
    return gameState.map.flat().filter(c => c.owner === team && c.isLand === isLand).length;
  };

  const baseVP = (team) => {
    const p = gameState.players[team];
    const land = countHexes(team, true) * LAND_VP;
    const sea = countHexes(team, false) * SEA_VP;
    const sci = p.science / 2;
    const cul = p.culture / 4;
    return land + sea + sci + cul;
  };

  const totalVP = (team) => {
    const base = baseVP(team);
    const misc = gameState.players[team].miscVP;
    const port = gameState.portCity === team ? 10 : 0;
    return base + misc + port;
  };

  const updateCell = (col, row, newOwner) => {
    setGameState(prev => ({
      ...prev,
      map: prev.map.map(rowArr => 
        rowArr.map(cell => 
          cell.col === col && cell.row === row ? {...cell, owner: newOwner} : cell
        )
      )
    }));
  };

  const addScience = (team, amount) => {
    setGameState(prev => {
      const p = prev.players[team];
      const before = Math.floor(p.science / SCIENCE_PER_BUFF);
      const newScience = p.science + amount;
      const after = Math.floor(newScience / SCIENCE_PER_BUFF);
      const newTokens = p.sciTokens + Math.max(0, after - before);
      
      const newPlayers = {
        ...prev.players,
        [team]: {...p, science: newScience, sciTokens: newTokens}
      };
      
      const newState = {...prev, players: newPlayers};
      
      if (newTokens > 0 && !prev.buffPicker) {
        newState.buffPicker = {team, type: 'science'};
      }
      
      return newState;
    });
  };

  const addCulture = (team, amount) => {
    setGameState(prev => {
      const p = prev.players[team];
      const before = Math.floor(p.culture / CULTURE_PER_BUFF);
      const newCulture = p.culture + amount;
      const after = Math.floor(newCulture / CULTURE_PER_BUFF);
      const newTokens = p.culTokens + Math.max(0, after - before);
      
      const newPlayers = {
        ...prev.players,
        [team]: {...p, culture: newCulture, culTokens: newTokens}
      };
      
      const newState = {...prev, players: newPlayers};
      
      if (newTokens > 0 && !prev.buffPicker) {
        newState.buffPicker = {team, type: 'culture'};
      }
      
      return newState;
    });
  };

  const applyBuff = (choice) => {
    if (!gameState.buffPicker) return;
    
    const {team, type} = gameState.buffPicker;
    
    setGameState(prev => {
      const p = prev.players[team];
      const newP = {...p};
      
      if (type === 'science') {
        newP.sciTokens--;
        if (choice === 'sail') newP.canSail = true;
        if (choice === 'military') newP.conquerDie = newP.conquerDie === 4 ? 6 : 8;
        if (choice === 'scholar') newP.scholarship = true;
        if (choice === 'infra') newP.infrastructure = true;
        if (choice === 'siege') newP.siegecraft = true;
      } else {
        newP.culTokens--;
        if (choice === 'diplo') newP.diplomacyImmunity += 3;
        if (choice === 'golden') newP.goldenAge = true;
        if (choice === 'tourism') newP.tourism = true;
        if (choice === 'assim') newP.assimilation = true;
      }
      
      const newPlayers = {...prev.players, [team]: newP};
      const newState = {...prev, players: newPlayers, buffPicker: null};
      
      if ((type === 'science' && newP.sciTokens > 0) || (type === 'culture' && newP.culTokens > 0)) {
        setTimeout(() => {
          setGameState(s => ({...s, buffPicker: {team, type}}));
        }, 100);
      }
      
      return newState;
    });
  };

  const rollConquer = () => {
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    
    if (p.diplomacyImmunity > 0) {
      setGameState(prev => ({...prev, status: `${currentPlayer} has immunity and cannot attack`}));
      return;
    }

    if (p.inRevolt) {
      const r = roll(4);
      if (r <= 2) {
        setGameState(prev => ({...prev, status: `Revolt failed (${r}/4)`, mode: 'Idle'}));
      } else {
        const capital = gameState.map.flat().find(c => c.capital === currentPlayer);
        if (capital) updateCell(capital.col, capital.row, currentPlayer);
        
        setGameState(prev => ({
          ...prev,
          players: {
            ...prev.players,
            [currentPlayer]: {
              ...prev.players[currentPlayer],
              inRevolt: false,
              diplomacyImmunity: 0,
              miscVP: prev.players[currentPlayer].miscVP + 10
            }
          },
          status: `${currentPlayer} revolt succeeds! (${r}/4) +10 VP. Immunity starts next turn.`
        }));
      }
      return;
    }

    let r = roll(p.conquerDie);
    let msg = `rolled ${r}`;
    
    if (p.thebesReroll) {
      const r2 = roll(p.conquerDie);
      r = Math.max(r, r2);
      msg = `rolled ${r} (Thebes reroll)`;
    }

    const total = r + (p.siegecraft ? 1 : 0);
    
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [currentPlayer]: {
          ...prev.players[currentPlayer],
          actions: {...prev.players[currentPlayer].actions, conquer: total}
        }
      },
      mode: 'conquer',
      status: `Conquer: ${total} actions (${msg}${p.siegecraft ? ' +1' : ''})`
    }));
  };

  const rollExpand = () => {
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    if (p.inRevolt) return;
    
    const r = roll(6);
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [currentPlayer]: {
          ...prev.players[currentPlayer],
          actions: {...prev.players[currentPlayer].actions, expand: r}
        }
      },
      mode: 'expand',
      status: `Expand: ${r} actions (rolled ${r})`
    }));
  };

  const rollSail = () => {
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    if (p.inRevolt || !p.canSail) return;
    
    const r = roll(8);
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [currentPlayer]: {
          ...prev.players[currentPlayer],
          actions: {...prev.players[currentPlayer].actions, sail: r}
        }
      },
      mode: 'sail',
      status: `Sail: ${r} actions (rolled ${r})`
    }));
  };

  const rollScience = () => {
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    if (p.inRevolt) return;
    
    let r = roll(12);
    let msg = `rolled ${r}`;
    
    if (p.scholarship) {
      const r2 = roll(12);
      r = Math.max(r, r2);
      msg = `rolled ${r} (Scholarship reroll)`;
    }
    
    const bonus = p.athensPassive ? 1 : 0;
    const total = r + bonus;
    addScience(currentPlayer, total);
    
    setGameState(prev => ({
      ...prev,
      status: `Science: +${total} (${msg}${bonus ? ' +1' : ''})`
    }));
  };

  const rollCulture = () => {
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    if (p.inRevolt) return;
    
    const r = roll(20);
    const bonus = (p.athensPassive ? 1 : 0) + (p.argosPlus2 ? 2 : 0);
    const total = r + bonus;
    addCulture(currentPlayer, total);
    
    setGameState(prev => ({
      ...prev,
      status: `Culture: +${total} (rolled ${r}${bonus ? ` +${bonus}` : ''})`
    }));
  };

  const handleCellClick = (cell) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    const mode = gameState.mode;
    
    if (mode === 'expand') {
      if (cell.owner || !cell.isLand || (!isAdjacent(cell, currentPlayer) && !cell.capital)) {
        setGameState(prev => ({...prev, status: 'Invalid expansion'}));
        return;
      }
      updateCell(cell.col, cell.row, currentPlayer);
      setGameState(prev => {
        const newActions = {...prev.players[currentPlayer].actions, expand: p.actions.expand - 1};
        return {
          ...prev,
          players: {
            ...prev.players,
            [currentPlayer]: {...prev.players[currentPlayer], actions: newActions}
          },
          mode: newActions.expand <= 0 ? 'Idle' : 'expand'
        };
      });
    }
    
    if (mode === 'sail') {
      if (cell.owner || cell.isLand || !isAdjacent(cell, currentPlayer)) {
        setGameState(prev => ({...prev, status: 'Invalid sailing'}));
        return;
      }
      updateCell(cell.col, cell.row, currentPlayer);
      setGameState(prev => {
        const newActions = {...prev.players[currentPlayer].actions, sail: p.actions.sail - 1};
        return {
          ...prev,
          players: {
            ...prev.players,
            [currentPlayer]: {...prev.players[currentPlayer], actions: newActions}
          },
          mode: newActions.sail <= 0 ? 'Idle' : 'sail'
        };
      });
    }
    
    if (mode === 'conquer') {
      if (p.diplomacyImmunity > 0) {
        setGameState(prev => ({...prev, status: 'Cannot attack while immune'}));
        return;
      }
      
      if (!cell.owner || cell.owner === currentPlayer) {
        setGameState(prev => ({...prev, status: 'Pick enemy hex'}));
        return;
      }
      
      if (!cell.isLand && !p.canSail) {
        setGameState(prev => ({...prev, status: 'Need Sailing for sea conquest'}));
        return;
      }
      
      const defender = gameState.players[cell.owner];
      if (defender.diplomacyImmunity > 0) {
        setGameState(prev => ({...prev, status: `${cell.owner} is immune`}));
        return;
      }
      
      const roundsCompleted = Math.floor(gameState.globalTurn / Math.max(1, gameState.teams.length));
      if (cell.capital && roundsCompleted < 4) {
        setGameState(prev => ({...prev, status: 'Capitals protected first 4 rounds'}));
        return;
      }
      
      if (!isAdjacent(cell, currentPlayer)) {
        setGameState(prev => ({...prev, status: 'Must be adjacent'}));
        return;
      }
      
      const prevOwner = cell.owner;
      updateCell(cell.col, cell.row, currentPlayer);
      
      let bonus = 0;
      if (cell.capital) bonus = 10;
      if (p.assimilation && !cell.capital) addCulture(currentPlayer, 1);
      
      setGameState(prev => {
        const newP = {...prev.players[currentPlayer]};
        newP.miscVP += bonus;
        newP.actions = {...newP.actions, conquer: p.actions.conquer - 1};
        
        const loserLand = prev.map.flat().filter(c => c.owner === prevOwner && c.isLand).length;
        let newPlayers = {...prev.players, [currentPlayer]: newP};
        
        if (loserLand === 0) {
          newP.miscVP += 10;
          newPlayers[prevOwner] = {...prev.players[prevOwner], inRevolt: true};
        }
        
        return {
          ...prev,
          players: newPlayers,
          mode: newP.actions.conquer <= 0 ? 'Idle' : 'conquer',
          status: bonus ? `Captured capital! +${bonus} VP` : prev.status
        };
      });
    }
  };

  const endTurn = () => {
    if (!gameState) return;
    
    const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
    const p = gameState.players[currentPlayer];
    let newMiscVP = p.miscVP;
    
    if (p.infrastructure) {
      newMiscVP += countHexes(currentPlayer, true) * 0.25;
    }
    
    if (p.tourism) {
      newMiscVP += countHexes(currentPlayer, false) * 0.5;
    }
    
    if (p.goldenAge) {
      const levels = Math.floor(p.culture / 20);
      if (levels > p.goldenAgeGranted) {
        newMiscVP += (levels - p.goldenAgeGranted);
      }
    }
    
    // Grant immunity if just exited revolt
    const wasInRevolt = p.inRevolt;
    const grantImmunity = !p.inRevolt && p.diplomacyImmunity === 0 && wasInRevolt === false;
    
    setGameState(prev => {
      const prevP = prev.players[currentPlayer];
      const justExitedRevolt = !prevP.inRevolt && prevP.diplomacyImmunity === 0;
      
      return {
        ...prev,
        players: {
          ...prev.players,
          [currentPlayer]: {
            ...prev.players[currentPlayer],
            miscVP: newMiscVP,
            diplomacyImmunity: justExitedRevolt ? 2 : Math.max(0, p.diplomacyImmunity - 1),
            actions: {conquer: 0, expand: 0, sail: 0},
            goldenAgeGranted: p.goldenAge ? Math.floor(p.culture / 20) : p.goldenAgeGranted
          }
        },
        mode: 'Idle',
        turnIdx: prev.turnIdx + 1,
        globalTurn: prev.globalTurn + 1,
        status: 'Turn ended'
      };
    });
  };

  if (!gameState) {
    return (
      <div>
        <TeamPicker onStart={initGame} onShowRules={() => setShowRules(true)} />
        {showRules && <RulesPage onClose={() => setShowRules(false)} />}
      </div>
    );
  }

  const currentPlayer = gameState.teams[gameState.turnIdx % gameState.teams.length];
  const p = gameState.players[currentPlayer];
  const roundsCompleted = Math.floor(gameState.globalTurn / Math.max(1, gameState.teams.length));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Struggle of the Poleis</h1>
          <button 
            onClick={() => setShowRules(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700"
          >
            Rules
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="overflow-auto max-h-[700px] border rounded">
              <canvas 
                ref={canvasRef}
                onClick={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const R = 20;
                  const dx = 1.5 * R;
                  const dy = Math.sqrt(3) * R;
                  
                  for (const row of gameState.map) {
                    for (const cell of row) {
                      const cx = 20 + R + cell.col * dx;
                      const cy = 20 + R + cell.row * dy + (cell.col % 2 === 1 ? dy/2 : 0);
                      const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
                      if (dist < R) {
                        handleCellClick(cell);
                        return;
                      }
                    }
                  }
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold" style={{color: TEAM_COLORS[currentPlayer]}}>
                  {currentPlayer}
                </h2>
                <span className="text-sm text-gray-600">Round {roundsCompleted + 1}</span>
              </div>
              
              {p.inRevolt && (
                <div className="bg-red-100 border border-red-300 rounded p-2 mb-2 text-sm">
                  <AlertCircle className="inline w-4 h-4 mr-1"/> Revolt Mode
                </div>
              )}
              
              {p.diplomacyImmunity > 0 && (
                <div className="bg-green-100 border border-green-300 rounded p-2 mb-2 text-sm">
                  <Shield className="inline w-4 h-4 mr-1"/> Immune ({p.diplomacyImmunity} turns)
                </div>
              )}
              
              <div className="text-sm text-gray-700 mb-3">{gameState.status}</div>
              
              <div className="space-y-2">
                <button 
                  onClick={rollConquer} 
                  disabled={!p} 
                  className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Dices className="w-4 h-4"/> Conquer (d{p?.conquerDie || 4})
                </button>
                <button 
                  onClick={rollExpand} 
                  disabled={!p || p.inRevolt} 
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  Expand (d6)
                </button>
                <button 
                  onClick={rollSail} 
                  disabled={!p || p.inRevolt || !p.canSail} 
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Anchor className="w-4 h-4"/> Sail (d8)
                </button>
                <button 
                  onClick={rollScience} 
                  disabled={!p || p.inRevolt} 
                  className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-4 h-4"/> Science (d12)
                </button>
                <button 
                  onClick={rollCulture} 
                  disabled={!p || p.inRevolt} 
                  className="w-full bg-yellow-600 text-white py-2 rounded font-semibold hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4"/> Culture (d20)
                </button>
              </div>
              
              <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                <div className="font-semibold mb-1">Actions Available:</div>
                <div>Conquer: {p?.actions.conquer || 0}</div>
                <div>Expand: {p?.actions.expand || 0}</div>
                <div>Sail: {p?.actions.sail || 0}</div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => setGameState(prev => ({...prev, mode: 'Idle'}))} 
                  className="flex-1 bg-gray-500 text-white py-2 rounded font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={endTurn} 
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
                >
                  End Turn →
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
              <h3 className="font-bold mb-3">Scoreboard</h3>
              <div className="space-y-2">
                {gameState.teams.map(t => {
                  const tp = gameState.players[t];
                  const vp = totalVP(t);
                  const landCt = countHexes(t, true);
                  const seaCt = countHexes(t, false);
                  
                  return (
                    <div key={t} className="border-2 rounded p-2" style={{borderColor: TEAM_COLORS[t]}}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold" style={{color: TEAM_COLORS[t]}}>{t}</span>
                        <span className="text-2xl font-bold">{vp.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>Land: {landCt} ({landCt * LAND_VP} VP) | Sea: {seaCt} ({seaCt * SEA_VP} VP)</div>
                        <div>Science: {tp.science.toFixed(1)} | Culture: {tp.culture}</div>
                        <div>Misc VP: {tp.miscVP.toFixed(1)}</div>
                        {gameState.portCity === t && <div className="text-green-600 font-semibold">⚓ Port City +10</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {gameState.buffPicker && (
        <BuffPicker 
          team={gameState.buffPicker.team}
          type={gameState.buffPicker.type}
          player={gameState.players[gameState.buffPicker.team]}
          onApply={applyBuff}
          onDefer={() => setGameState(prev => ({...prev, buffPicker: null}))}
        />
      )}
      
      {showRules && <RulesPage onClose={() => setShowRules(false)} />}
    </div>
  );
};

export default App;