"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster, toast } from "sonner";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
let genAI;
let model;

if (typeof window !== "undefined" && API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
} else if (typeof window !== "undefined" && !API_KEY) {
  console.error(
    "Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요."
  );
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "generate_korean_word_chain_word",
        description:
          "제시된 시작 글자로 시작하고, 이전에 사용되지 않은 유효한 한글 명사 단어를 생성하여 끝말잇기를 이어갑니다. 한 글자 단어나 이미 사용된 단어는 생성하지 마세요.",
        parameters: {
          type: "OBJECT",
          properties: {
            startLetter: {
              type: "STRING",
              description: "새로 생성할 단어의 시작 글자입니다. (예: \'기\')",
            },
            usedWords: {
              type: "ARRAY",
              items: { type: "STRING" },
              description:
                "게임에서 이미 사용된 단어들의 목록입니다. 이 목록에 없는 단어를 생성해야 합니다. (예: [\'시작\', \'자동차\'])",
            },
          },
          required: ["startLetter", "usedWords"],
        },
      },
    ],
  },
];

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [gameMessage, setGameMessage] = useState(
    "첫 단어를 입력하고 게임을 시작하세요!"
  );
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const getAiResponse = useCallback(async (startLetter, usedWordsList) => {
    if (!model) {
      toast.error("AI 모델이 초기화되지 않았습니다. API 키를 확인해주세요.");
      console.error("[DEBUG] AI 모델 초기화 안됨");
      return null;
    }
    setIsAiThinking(true);
    console.log(
      `[DEBUG] getAiResponse 호출됨. 시작 글자: ${startLetter}, 사용된 단어: ${usedWordsList.join(", ")}`
    );
    try {
      const chat = model.startChat({
        tools: tools,
      });

      const prompt = `끝말잇기 게임입니다. 당신은 다음 단어를 추천해야 합니다. 조건: '${startLetter}'(으)로 시작해야 하고, [${usedWordsList.join(", ")}] 목록에 있는 단어는 사용하면 안 됩니다. 한 글자 단어도 안 됩니다. 다른 설명이나 말 없이, 오직 추천하는 한글 명사 단어 하나만을 텍스트로 응답해주세요. 예를 들어 "사과" 또는 "나무" 처럼 단어만 말하세요. 함수를 호출할 필요 없습니다. 한국어 사전을 기준으로 존재하는 단어만을 사용하세요. 없는단어를 만들어내지 마세요`;
      console.log("[DEBUG] 생성된 프롬프트 (텍스트 응답 유도 강화):", prompt);

      const result = await chat.sendMessage(prompt);
      console.log(
        "[DEBUG] API 결과 (result):",
        JSON.stringify(result, null, 2)
      );

      const response = result.response;
      console.log(
        "[DEBUG] API 응답 (response):",
        JSON.stringify(response, null, 2)
      );

      if (response.text) {
        const aiText = response.text().trim();
        if (response.functionCalls && response.functionCalls.length > 0) {
          console.warn(
            "[DEBUG] AI가 텍스트와 함께 함수 호출도 제안했습니다:",
            JSON.stringify(response.functionCalls[0], null, 2)
          );
        }
        console.log("[DEBUG] AI 텍스트 응답:", aiText);
        if (aiText) return aiText;
      }

      if (response.functionCalls && response.functionCalls.length > 0) {
        console.log(
          "[DEBUG] AI가 (텍스트 없이) 함수 호출만 제안했습니다:",
          JSON.stringify(response.functionCalls[0], null, 2)
        );
        toast.error(
          "AI가 단어를 직접 생성하지 않고 함수 호출을 제안했습니다. 프롬프트를 확인해주세요."
        );
        return null;
      }

      toast.error(
        "AI가 응답을 생성하지 못했습니다. (텍스트/함수 호출 모두 유효하지 않음)"
      );
      console.error("[DEBUG] AI 응답에 유효한 텍스트나 함수 호출이 없음");
      return null;
    } catch (error) {
      console.error("[DEBUG] AI 응답 생성 중 오류 발생:", error);
      toast.error("AI 응답 생성 중 오류가 발생했습니다.");
      return null;
    } finally {
      setIsAiThinking(false);
      console.log("[DEBUG] getAiResponse 종료");
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    if (isAiThinking) return;

    const userWord = inputValue.trim();
    if (!userWord) {
      toast.error("단어를 입력해주세요!");
      return;
    }

    // 게임 시작: 사용자가 첫 단어를 입력하는 경우
    if (history.length === 0) {
      if (userWord.length <= 1) {
        toast.error("두 글자 이상의 단어를 입력해주세요.");
        return;
      }
      setHistory([userWord]);
      setCurrentWord(userWord);
      setInputValue("");
      setGameMessage(
        `'${userWord.charAt(userWord.length - 1)}'(으)로 시작하는 단어를 AI가 생각 중입니다...`
      );

      // AI에게 첫 단어의 마지막 글자로 시작하는 단어 요청
      const aiStartLetter = userWord.charAt(userWord.length - 1);
      const aiWord = await getAiResponse(aiStartLetter, [userWord]); // history 대신 [userWord] 전달

      if (aiWord) {
        if ([userWord].includes(aiWord)) {
          // history 대신 [userWord]로 검사
          toast.error(
            `AI가 이미 사용된 단어('${aiWord}')를 제시했습니다. 다시 시도합니다.`
          );
          setGameMessage("AI가 중복된 단어를 제시했습니다. 당신의 차례입니다.");
          // 이 경우, 사용자가 다시 첫 단어를 입력하도록 하거나, 다른 로직을 추가할 수 있습니다.
          // 여기서는 일단 게임 메시지만 변경하고, currentWord는 사용자가 입력한 첫 단어로 유지합니다.
          return;
        }
        if (aiWord.length <= 1) {
          toast.error(
            `AI가 한 글자 단어('${aiWord}')를 제시했습니다. 다시 시도합니다.`
          );
          setGameMessage(
            "AI가 너무 짧은 단어를 제시했습니다. 당신의 차례입니다."
          );
          return;
        }
        if (aiStartLetter !== aiWord.charAt(0)) {
          toast.error(
            `AI가 규칙에 맞지 않는 단어('${aiWord}')를 제시했습니다. (시작 글자 불일치)`
          );
          setGameMessage(
            "AI가 규칙에 어긋난 단어를 제시했습니다. 당신의 차례입니다."
          );
          return;
        }

        setHistory([userWord, aiWord]); // history 업데이트
        setCurrentWord(aiWord);
        const nextUserStartLetter = aiWord.charAt(aiWord.length - 1);
        setGameMessage(
          `'${nextUserStartLetter}'(으)로 시작하는 단어를 입력하세요.`
        );
      } else {
        // AI가 첫 단어에 대한 응답을 못 찾은 경우, 사용자가 입력한 단어를 현재 단어로 유지하고 다시 사용자 턴으로.
        setGameMessage(
          `AI가 '${aiStartLetter}'(으)로 시작하는 단어를 찾지 못했습니다. 다시 첫 단어를 입력해주세요.`
        );
        setCurrentWord(userWord); // 사용자가 입력한 첫 단어 유지
        setHistory([userWord]); // history도 사용자가 입력한 첫 단어만 유지
      }
      return; // 첫 단어 처리 후 함수 종료
    }

    // 게임 진행 중: 사용자가 다음 단어를 입력하는 경우
    if (currentWord.charAt(currentWord.length - 1) !== userWord.charAt(0)) {
      toast.error(
        `'${currentWord.charAt(currentWord.length - 1)}'(으)로 시작하는 단어를 입력해야 합니다.`
      );
      return;
    }

    if (history.includes(userWord)) {
      toast.error("이미 사용된 단어입니다.");
      return;
    }
    if (userWord.length <= 1) {
      toast.error("두 글자 이상의 단어를 입력해주세요.");
      return;
    }

    const newHistory = [...history, userWord];
    setHistory(newHistory);
    setCurrentWord(userWord);
    setInputValue("");
    setGameMessage("AI가 다음 단어를 생각 중입니다...");

    const aiStartLetter = userWord.charAt(userWord.length - 1);
    const aiWord = await getAiResponse(aiStartLetter, newHistory);
    console.log(aiWord);

    if (aiWord) {
      if (newHistory.includes(aiWord)) {
        toast.error(
          `AI가 이미 사용된 단어('${aiWord}')를 제시했습니다. 다시 시도합니다.`
        );
        setGameMessage("AI가 중복된 단어를 제시했습니다. 당신의 차례입니다.");
        return;
      }
      if (aiWord.length <= 1) {
        toast.error(
          `AI가 한 글자 단어('${aiWord}')를 제시했습니다. 다시 시도합니다.`
        );
        setGameMessage(
          "AI가 너무 짧은 단어를 제시했습니다. 당신의 차례입니다."
        );
        return;
      }
      if (aiStartLetter !== aiWord.charAt(0)) {
        toast.error(
          `AI가 규칙에 맞지 않는 단어('${aiWord}')를 제시했습니다. (시작 글자 불일치)`
        );
        setGameMessage(
          "AI가 규칙에 어긋난 단어를 제시했습니다. 당신의 차례입니다."
        );
        return;
      }

      setHistory([...newHistory, aiWord]);
      setCurrentWord(aiWord);
      const nextUserStartLetter = aiWord.charAt(aiWord.length - 1);
      setGameMessage(
        `'${nextUserStartLetter}'(으)로 시작하는 단어를 입력하세요.`
      );
    } else {
      setGameMessage(
        "AI가 단어를 찾지 못했습니다. 당신의 승리! 다시 시작하려면 새 단어를 입력하세요."
      );
    }
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const [isApiReady, setIsApiReady] = useState(false);
  useEffect(() => {
    if (API_KEY && genAI && model) {
      setIsApiReady(true);
    } else if (!API_KEY && typeof window !== "undefined") {
      toast.error(
        "Gemini API 키가 없습니다. .env.local 파일을 설정해주세요! AI 기능이 제한됩니다.",
        { duration: 10000 }
      );
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 font-[family-name:var(--font-geist-sans)]">
      <Toaster richColors position="top-center" />
      <main className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            AI 끝말잇기 (Gemini)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI와 함께하는 신나는 끝말잇기 한판!
          </p>
          {!isApiReady && API_KEY && (
            <p className="text-yellow-500 text-xs">AI 모델 초기화 중...</p>
          )}
          {!API_KEY && (
            <p className="text-red-500 text-xs">
              API 키가 없어 AI 기능이 비활성화되었습니다.
            </p>
          )}
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>게임 진행</CardTitle>
            <CardDescription>
              {isAiThinking ? "AI가 생각 중..." : gameMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                현재 단어:
              </p>
              <p className="text-2xl font-semibold text-center text-blue-600 dark:text-blue-400 p-3 border rounded-md bg-blue-50 dark:bg-blue-900/30">
                {currentWord}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              사용된 단어: {history.join(", ")}
            </p>
          </CardFooter>
        </Card>

        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="단어를 입력하세요..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            className="flex-1"
            aria-label="단어 입력"
            disabled={isAiThinking || !isApiReady}
          />
          <Button onClick={handleSubmit} disabled={isAiThinking || !isApiReady}>
            {isAiThinking ? "전송 중..." : "제출"}
          </Button>
        </div>

        <Alert>
          <AlertTitle>게임 규칙!</AlertTitle>
          <AlertDescription>
            - 제시된 단어의 마지막 글자로 시작하는 단어를 입력해주세요.
            <br />- 한 글자 단어, 이미 사용된 단어는 사용할 수 없어요.
          </AlertDescription>
        </Alert>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
          <p>즐거운 게임 되세요!</p>
        </footer>
      </main>
    </div>
  );
}
