import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Reset state when questions change (new PDF loaded)
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
  }, [questions]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer

    setSelectedOption(index);
    
    // Ensure we are comparing numbers, guarding against potential string return from AI
    const correctIndex = Number(questions[currentQuestionIndex].correctAnswerIndex);
    
    if (index === correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
  };

  if (!questions || questions.length === 0) {
    return <div className="text-gray-500 text-center py-10">Nenhum questionário gerado.</div>;
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Resultado do Quiz</h2>
        <div className="text-6xl font-bold text-gray-800 mb-6">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p className="text-xl text-gray-600 mb-8">
          Você acertou <span className="font-bold text-indigo-600">{score}</span> de <span className="font-bold text-indigo-600">{questions.length}</span> questões.
        </p>
        <button
          onClick={restartQuiz}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];
  // Ensure strict number conversion for render logic too
  const correctIndex = Number(question.correctAnswerIndex);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-indigo-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
          <span className="text-indigo-800 font-bold uppercase tracking-wider text-sm">Questão {currentQuestionIndex + 1} de {questions.length}</span>
          <span className="text-indigo-600 font-bold text-sm">Pontuação: {score}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Content */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let buttonStyle = "border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 text-gray-700";
              
              if (selectedOption !== null) {
                if (idx === correctIndex) {
                  buttonStyle = "bg-green-100 border-green-500 text-green-800 font-medium"; // Correct
                } else if (idx === selectedOption) {
                  buttonStyle = "bg-red-100 border-red-500 text-red-800"; // Wrong selected
                } else {
                  buttonStyle = "border-gray-100 text-gray-400 opacity-60"; // Others
                }
              } else {
                 buttonStyle = "bg-white border-gray-200 hover:border-indigo-500 hover:shadow-md cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center ${buttonStyle}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold text-sm
                    ${selectedOption !== null && idx === correctIndex ? 'border-green-500 bg-green-500 text-white' : 
                      selectedOption === idx ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-base">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Section */}
          {selectedOption !== null && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 animate-fade-in">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">Explicação</h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
                >
                  {currentQuestionIndex === questions.length - 1 ? "Ver Resultado" : "Próxima Questão"}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;