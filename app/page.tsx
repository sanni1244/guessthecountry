"use client";

import { useState, useEffect } from "react";

interface Country {
  name: { common: string; official: string };
  flags: { svg: string; png: string };
  independent: boolean;
  unMember: boolean;
}

export default function FlagGame() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [guess, setGuess] = useState("");

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const [isP1Disabled, setIsP1Disabled] = useState(false);
  const [isP2Disabled, setIsP2Disabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,independent,unMember")
      .then((res) => res.json())
      .then((data: Country[]) => {
        const realCountries = data.filter((c) => c.independent && c.unMember);
        const shuffled = realCountries.sort(() => 0.5 - Math.random());
        setCountries(shuffled);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || isPaused || isRevealed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isPaused, isRevealed, timeLeft]);

  const handleRevealAction = () => {
    setIsRevealed(true);
    setIsNextDisabled(true);
    setTimeout(() => {
      setIsNextDisabled(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed) return;

    const currentName = countries[currentIndex]?.name.common.toLowerCase();
    if (guess.toLowerCase().trim() === currentName) {
      handleRevealAction();
    }
  };

  const handleReveal = () => {
    handleRevealAction();
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    setCurrentIndex((prev) => prev + 1);
    setTimeLeft(10);
    setIsRevealed(false);
    setGuess("");
    setIsPaused(false);
  };

  const updateP1Score = (amount: number) => {
    if (isP1Disabled) return;
    setPlayer1Score((s) => s + amount);
    setIsP1Disabled(true);
    setTimeout(() => setIsP1Disabled(false), 1000);
  };

  const updateP2Score = (amount: number) => {
    if (isP2Disabled) return;
    setPlayer2Score((s) => s + amount);
    setIsP2Disabled(true);
    setTimeout(() => setIsP2Disabled(false), 1000);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-500 text-gray-100 font-[Figtree,sans-serif]">Loading game...</div>;
  }

  if (currentIndex >= countries.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-500 text-gray-100 font-[Figtree,sans-serif]">
        <h1 className="text-3xl font-bold">Game Over!</h1>
        <div className="flex gap-8 text-xl">
          <p>THE KING: {player1Score}</p>
          <p>THE QUEEN: {player2Score}</p>
        </div>
        <button onClick={() => window.location.reload()} className="rounded-sm bg-blue-600 px-4 py-2 text-gray-100 hover:bg-blue-700">
          Play Again
        </button>
      </div>
    );
  }

  const currentCountry = countries[currentIndex];
  const isCorrect = isRevealed && guess.toLowerCase().trim() === currentCountry.name.common.toLowerCase();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-gray-900 font-[Figtree,sans-serif]">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <div className="mb-6 flex w-full items-center justify-center gap-4 md:gap-8">
          <div className="flex flex-col items-center rounded-sm bg-gray-300 p-3 shadow-sm w-36">
            <span className="mb-2 font-bold uppercase tracking-wider text-gray-700 text-sm">THE KING</span>
            <div className="flex items-center gap-2 text-xl font-bold">
              <button onClick={() => updateP1Score(-1)} disabled={isP1Disabled} className="flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 hover:bg-gray-500 text-gray-900 disabled:opacity-50">
                -
              </button>
              <span className="w-6 text-center">{player1Score}</span>
              <button onClick={() => updateP1Score(1)} disabled={isP1Disabled} className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-600 hover:bg-blue-700 text-gray-100 disabled:opacity-50">
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-sm bg-gray-300 p-3 shadow-sm w-40">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Flag {currentIndex + 1} of {countries.length}
            </div>
            <div className={`text-3xl font-black tracking-tighter ${timeLeft <= 3 && !isRevealed ? "text-red-600" : "text-gray-800"}`}>00:{timeLeft.toString().padStart(2, "0")}</div>
          </div>

          <div className="flex flex-col items-center rounded-sm bg-gray-300 p-3 shadow-sm w-36">
            <span className="mb-2 font-bold uppercase tracking-wider text-gray-700 text-sm">THE QUEEN</span>
            <div className="flex items-center gap-2 text-xl font-bold">
              <button onClick={() => updateP2Score(-1)} disabled={isP2Disabled} className="flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 hover:bg-gray-500 text-gray-900 disabled:opacity-50">
                -
              </button>
              <span className="w-6 text-center">{player2Score}</span>
              <button onClick={() => updateP2Score(1)} disabled={isP2Disabled} className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-600 hover:bg-blue-700 text-gray-100 disabled:opacity-50">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 flex h-72 w-full items-center justify-center overflow-hidden rounded-sm border-4 border-gray-300 bg-gray-200 shadow-sm p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentCountry.flags.svg} alt="Guess the flag" className="h-full w-full object-contain" />
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {isRevealed && <div className={`text-center text-3xl font-black uppercase tracking-widest ${isCorrect ? "text-blue-700" : "text-gray-900"}`}>{currentCountry.name.common}</div>}

          <div className="flex w-full justify-between gap-4 pt-4">
            {!isRevealed ? (
              <>
                <button type="button" onClick={() => setIsPaused(!isPaused)} className="flex-1 rounded-sm border-2 border-gray-400 bg-gray-300 py-3 font-bold text-gray-800 hover:bg-gray-400 transition-colors">
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button type="button" onClick={handleReveal} className="flex-1 rounded-sm border-2 border-gray-400 bg-gray-300 py-3 font-bold text-gray-800 hover:bg-gray-400 transition-colors">
                  Reveal
                </button>
              </>
            ) : (
              <button type="button" onClick={handleNext} disabled={isNextDisabled} className="w-full rounded-sm bg-blue-600 py-4 text-xl font-black uppercase tracking-widest text-gray-100 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isNextDisabled ? "Wait..." : "Next Flag"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
