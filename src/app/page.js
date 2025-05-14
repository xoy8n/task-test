"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { fetchNextWordFromAI } from "@/lib/geminiService";

export default function Home() {
  const [currentWord, setCurrentWord] = useState(""); // AI가 제시한 단어 또는 사용자가 시작할 단어
  const [playerInput, setPlayerInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [gameMessage, setGameMessage] = useState("AI와 끝말잇기를 시작하세요!");
  const [usedWords, setUsedWords] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // 시작은 플레이어 턴
  const [gameOver, setGameOver] = useState(false);

  const usedWordsListRef = useRef(null);

  useEffect(() => {
    // 사용된 단어 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
    if (usedWordsListRef.current) {
      usedWordsListRef.current.scrollTop =
        usedWordsListRef.current.scrollHeight;
    }
  }, [usedWords]);

  const startGame = () => {
    setUsedWords([]);
    setCurrentWord(""); // AI가 첫 단어를 제시하도록 하거나, 사용자가 입력하도록 유도
    setPlayerInput("");
    setGameMessage("당신의 차례입니다. 단어를 입력하세요.");
    setIsPlayerTurn(true);
    setGameOver(false);
    setAiThinking(false);
  };

  const handlePlayerInputChange = (e) => {
    setPlayerInput(e.target.value);
  };

  const handlePlayerSubmit = async () => {
    if (!playerInput.trim() || gameOver) return;

    const newWord = playerInput.trim();

    // 1. 간단한 유효성 검사 (여기서는 중복 및 한 글자 단어만 체크)
    if (newWord.length <= 1) {
      setGameMessage("두 글자 이상의 단어를 입력해주세요.");
      return;
    }
    if (usedWords.includes(newWord)) {
      setGameMessage(`'${newWord}'는 이미 사용된 단어입니다.`);
      return;
    }
    if (
      currentWord &&
      newWord.charAt(0) !== currentWord.charAt(currentWord.length - 1)
    ) {
      setGameMessage(
        `'${currentWord.charAt(currentWord.length - 1)}' (으)로 시작하는 단어를 입력해야 합니다.`
      );
      setPlayerInput("");
      return;
    }

    setUsedWords((prev) => [...prev, newWord]);
    setCurrentWord(newWord);
    setPlayerInput("");
    setIsPlayerTurn(false);
    setAiThinking(true);
    setGameMessage("AI가 생각 중입니다...");

    const aiResult = await fetchNextWordFromAI(newWord, [
      ...usedWords,
      newWord,
    ]);
    setAiThinking(false);

    if (aiResult.word) {
      const aiWord = aiResult.word;
      if (
        usedWords.includes(aiWord) ||
        aiWord.charAt(0) !== newWord.charAt(newWord.length - 1)
      ) {
        setGameMessage(
          `AI가 규칙에 어긋난 단어(${aiWord})를 제시하여 당신의 승리!`
        );
        setGameOver(true);
        return;
      }
      setUsedWords((prev) => [...prev, aiWord]);
      setCurrentWord(aiWord);
      setGameMessage(`AI 응답: ${aiWord}. 당신의 차례입니다.`);
      setIsPlayerTurn(true);
    } else {
      setGameMessage(
        aiResult.error || "AI가 단어를 찾지 못했습니다. 당신의 승리!"
      );
      setGameOver(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 font-sans text-white">
      <Card className="w-full max-w-lg bg-slate-800 border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            AI 끝말잇기
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gemini AI와 즐기는 한글 끝말잇기 한판!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 mb-2 rounded-md bg-slate-700 shadow-inner min-h-[60px] flex items-center justify-center">
            <p
              className={`text-lg ${gameOver ? "text-red-400" : "text-sky-300"}`}
            >
              {gameMessage}
            </p>
          </div>

          {currentWord && !gameOver && (
            <div className="text-center text-slate-300">
              <p>
                현재 단어:{" "}
                <span className="font-semibold text-2xl text-amber-400">
                  {currentWord}
                </span>
              </p>
              <p className="text-sm">
                {isPlayerTurn ? "당신의 차례입니다." : "AI의 차례입니다."}
              </p>
            </div>
          )}

          {isPlayerTurn && !gameOver && (
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Input
                type="text"
                value={playerInput}
                onChange={handlePlayerInputChange}
                placeholder={
                  currentWord
                    ? `${currentWord.charAt(currentWord.length - 1)} (으)로 시작하는 단어...`
                    : "첫 단어를 입력하세요..."
                }
                className="flex-grow bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-purple-500 focus:border-purple-500"
                disabled={aiThinking || gameOver}
                onKeyPress={(e) => e.key === "Enter" && handlePlayerSubmit()}
              />
              <Button
                onClick={handlePlayerSubmit}
                disabled={aiThinking || gameOver || !playerInput.trim()}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-70 transition-all duration-150 ease-in-out transform active:scale-95"
              >
                {aiThinking ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    전송 중...
                  </>
                ) : (
                  "단어 제출"
                )}
              </Button>
            </div>
          )}

          {gameOver && (
            <Button
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              새 게임 시작
            </Button>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-slate-300">
              지금까지 사용된 단어들:
            </h3>
            {usedWords.length > 0 ? (
              <div
                ref={usedWordsListRef}
                className="max-h-32 overflow-y-auto p-3 bg-slate-700/50 rounded-md scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50"
              >
                <ul className="space-y-1">
                  {usedWords.map((word, index) => (
                    <li
                      key={index}
                      className={`text-sm ${index % 2 === 0 ? "text-slate-300" : "text-slate-400"}`}
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                아직 사용된 단어가 없습니다.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-center text-slate-500 justify-center">
          <p>간단 끝말잇기 AI (v0.1.0) - React 19 & Gemini</p>
        </CardFooter>
      </Card>
    </div>
  );
}
