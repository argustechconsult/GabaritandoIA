import * as React from 'react';
import { useState } from 'react';
import { Slide } from '../types';

interface SlidesProps {
  slides: Slide[];
}

const Slides: React.FC<SlidesProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">
        Nenhum slide gerado.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl aspect-video bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
        {/* Slide Content */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-indigo-700 mb-8 border-b-4 border-indigo-100 pb-4">
            {slides[currentSlide].title}
          </h2>
          <ul className="space-y-4">
            {slides[currentSlide].bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start text-xl text-gray-700">
                <span className="mr-3 text-indigo-500 text-2xl">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
          <span className="text-sm text-gray-400 font-medium">
            GabaritandoIA
          </span>
          <span className="text-sm text-gray-500 font-bold">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6 mt-8">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white shadow-md hover:bg-gray-50 text-indigo-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentSlide ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white shadow-md hover:bg-gray-50 text-indigo-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Slides;
