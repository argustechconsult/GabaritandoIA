import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';

interface FlashcardsProps {
  cards: Flashcard[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Total de passos é cards + 1 (para a tela de parabéns)
  const totalSteps = cards.length + 1;
  const isFinished = currentIndex === cards.length;

  // Reset state when cards change (new PDF loaded)
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const handleNext = () => {
    if (!isFinished) setIsFlipped(false);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSteps);
    }, isFinished ? 0 : 150);
  };

  const handlePrev = () => {
    if (!isFinished) setIsFlipped(false);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + totalSteps) % totalSteps);
    }, isFinished ? 0 : 150);
  };

  const toggleFlip = () => {
    if (!isFinished) {
      setIsFlipped(!isFlipped);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if ((e.key === ' ' || e.key === 'Enter') && !isFinished) toggleFlip();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length, isFinished, totalSteps]); // Dependencies updated

  if (!cards || cards.length === 0) {
    return <div className="text-gray-500 text-center py-10">Nenhum cartão gerado.</div>;
  }

  const currentCard = !isFinished ? cards[currentIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center py-8 min-h-[600px]">
      <style>{`
        @keyframes firework {
          0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
          50% { width: 0.5vmin; opacity: 1; }
          100% { width: var(--finalSize); opacity: 0; }
        }
        .firework,
        .firework::before,
        .firework::after {
          --initialSize: 0.5vmin;
          --finalSize: 45vmin;
          --particleSize: 0.2vmin;
          --color1: yellow;
          --color2: khaki;
          --color3: white;
          --color4: lime;
          --color5: gold;
          --color6: mediumseagreen;
          --y: -30vmin;
          --x: -50%;
          --initialY: 60vmin;
          content: "";
          animation: firework 2s infinite;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, var(--y));
          width: var(--initialSize);
          aspect-ratio: 1;
          background: 
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
            
            radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
            radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 90% 70%,
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 60%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 55% 80%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 70% 77%,
            
            radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 22% 90%,
            radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 45% 90%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 70%,
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 10% 60%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 31% 80%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 28% 77%,
            radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 13% 72%,
            
            radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 80% 10%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 95% 14%,
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 90% 23%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 100% 43%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 85% 27%,
            radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 77% 37%,
            radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 60% 7%,
            
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 22% 14%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 45% 20%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 34%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 10% 29%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 31% 37%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 28% 7%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 13% 42%
            ;
          background-size: var(--initialSize) var(--initialSize);
          background-repeat: no-repeat;
        }

        .firework::before {
          --x: -50%;
          --y: -50%;
          --initialY: -50%;
          transform: translate(-50%, -50%) rotate(40deg) scale(1.3) rotateY(40deg);
        }

        .firework::after {
          --x: -50%;
          --y: -50%;
          --initialY: -50%;
          transform: translate(-50%, -50%) rotate(170deg) scale(1.15) rotateY(-30deg);
        }

        .firework:nth-child(2) {
          --x: 30vmin;
          --y: -30vmin;
        }
        .firework:nth-child(2),
        .firework:nth-child(2)::before,
        .firework:nth-child(2)::after {
          --color1: pink;
          --color2: violet;
          --color3: fuchsia;
          --color4: orchid;
          --color5: plum;
          --color6: lavender;  
          --finalSize: 40vmin;
          left: 30%;
          top: 60%;
          animation-delay: -0.25s;
        }

        .firework:nth-child(3) {
          --x: -30vmin;
          --y: -50vmin;
        }
        .firework:nth-child(3),
        .firework:nth-child(3)::before,
        .firework:nth-child(3)::after {
          --color1: cyan;
          --color2: lightcyan;
          --color3: lightblue;
          --color4: palequoturquoise;
          --color5: skyblue;
          --color6: lavender;
          --finalSize: 35vmin;
          left: 70%;
          top: 60%;
          animation-delay: -0.4s;
        }
      `}</style>
      
      {/* Navigation and Card Container */}
      <div className="flex items-center justify-center w-full max-w-5xl gap-4 md:gap-8">
        
        {/* Prev Button */}
        <button 
          onClick={handlePrev}
          className="p-3 md:p-4 rounded-full bg-white shadow-lg text-indigo-600 hover:bg-indigo-50 transition-transform hover:-translate-x-1 focus:outline-none z-10"
          title="Anterior (Seta Esquerda)"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Card Area */}
        <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-[3/2] perspective-1000">
          
          {isFinished ? (
            /* Success Screen */
             <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 to-purple-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center p-8 overflow-hidden">
                <div className="firework"></div>
                <div className="firework"></div>
                <div className="firework"></div>
                
                <div className="z-10 bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
                  <span className="text-4xl mb-4 block">🎉</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Parabéns!</h2>
                  <p className="text-xl text-indigo-100">Você concluiu todos os {cards.length} cards.</p>
                  <button 
                    onClick={() => setCurrentIndex(0)}
                    className="mt-8 px-6 py-2 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Estudar Novamente
                  </button>
                </div>
             </div>
          ) : (
            /* Flashcard */
            <>
              {/* Decorative Background Stack Effects (Visual depth) */}
              <div className="absolute top-0 left-0 w-full h-full bg-indigo-100 rounded-2xl transform translate-x-4 translate-y-4 -z-10 shadow-sm opacity-60"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-indigo-200 rounded-2xl transform translate-x-2 translate-y-2 -z-10 shadow-sm opacity-80"></div>

              {/* The Active Card */}
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer shadow-2xl rounded-2xl ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                onClick={toggleFlip}
              >
                {/* Front (Question) */}
                <div className="absolute w-full h-full bg-white rounded-2xl border-2 border-indigo-50 p-8 md:p-12 flex flex-col items-center justify-center backface-hidden">
                  <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-6 bg-indigo-50 px-3 py-1 rounded-full">
                    Pergunta
                  </span>
                  <p className="text-lg md:text-2xl font-medium text-gray-800 text-center leading-relaxed select-none">
                    {currentCard!.question}
                  </p>
                  <div className="absolute bottom-6 text-sm text-gray-400 font-medium animate-bounce">
                    Clique para ver a resposta
                  </div>
                </div>

                {/* Back (Answer) */}
                <div
                  className="absolute w-full h-full bg-indigo-600 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center backface-hidden"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                  <span className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-6 bg-indigo-700 px-3 py-1 rounded-full">
                    Resposta
                  </span>
                  <p className="text-lg md:text-2xl font-medium text-white text-center leading-relaxed select-none">
                    {currentCard!.answer}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="p-3 md:p-4 rounded-full bg-white shadow-lg text-indigo-600 hover:bg-indigo-50 transition-transform hover:translate-x-1 focus:outline-none z-10"
          title="Próximo (Seta Direita)"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Progress Counter */}
      <div className="mt-8 flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-900 font-mono">
          {isFinished ? cards.length : currentIndex + 1} <span className="text-gray-400 text-lg">/</span> {cards.length}
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
          <div 
            className={`h-full bg-indigo-500 transition-all duration-300 ease-out ${isFinished ? 'bg-green-500' : ''}`}
            style={{ width: `${(currentIndex / cards.length) * 100}%` }} // Changed to use simple percentage for logic match
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Use as setas do teclado para navegar</p>
      </div>
    </div>
  );
};

export default Flashcards;