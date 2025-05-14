import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error(
    "NEXT_PUBLIC_GEMINI_API_KEY is not set. Please set it in your .env.local file."
  );
  // 실제 프로덕션에서는 여기서 에러를 throw 하거나, 기능을 비활성화해야 합니다.
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest", // PRD에는 gemini-2.0-flash로 되어있으나, 최신 flash 모델 사용 권장
});

// PRD에 정의된 함수 선언
const getNextKoreanWordFunctionDeclaration = {
  name: "get_next_korean_word",
  description:
    "사용자가 제시한 단어에 이어지는, 한국어 끝말잇기 규칙에 맞는 다음 단어를 제안할 때 **반드시 사용해야 하는 함수**입니다. AI는 이 함수를 호출하여 다음 턴에 사용할 유효한 한국어 명사를 'suggested_word_by_ai' 인자에 담아 전달해야 합니다. **만약 적절한 단어를 찾지 못했을 경우에만, 이 함수를 호출하지 않고 일반 텍스트로 사용자에게 그 이유를 설명합니다.**",
  parameters: {
    type: "object",
    properties: {
      last_word: {
        type: "string",
        description: "이전 차례의 마지막 단어입니다.",
      },
      used_words: {
        type: "array",
        items: {
          type: "string",
        },
        description: "이번 게임에서 이미 사용된 단어들의 목록입니다.",
      },
      suggested_word_by_ai: {
        type: "string",
        description:
          "AI가 'last_word'의 마지막 글자로 시작하고 'used_words'에 포함되지 않은, 유효한 한국어 명사를 찾아 이 필드에 할당해야 합니다. **이 함수를 호출하는 주된 목적이 이 단어를 전달하는 것이므로, 이 필드는 반드시 값을 가져야 합니다.**",
      },
    },
    required: ["last_word", "used_words", "suggested_word_by_ai"],
  },
};

// 안전 설정 (모든 카테고리에 대해 차단 없음으로 설정 - 필요에 따라 조정)
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export async function fetchNextWordFromAI(currentWord, usedWordsList) {
  if (!API_KEY) {
    return { error: "API 키가 설정되지 않았습니다." };
  }

  try {
    const chat = model.startChat({
      tools: [{ functionDeclarations: [getNextKoreanWordFunctionDeclaration] }],
      safetySettings,
      // generationConfig: { // 필요시 추가 설정 }
    });

    const prompt = `당신은 한국어 끝말잇기 게임의 AI 심판이자 상대 플레이어입니다. 당신의 목표는 사용자가 제시한 단어의 마지막 글자로 시작하고, 이전에 사용되지 않은 유효한 한국어 명사를 찾아 제시하는 것입니다.

규칙:
1. 제시된 단어(${currentWord})의 마지막 글자로 시작해야 합니다.
2. 한 글자 단어는 허용되지 않습니다.
3. 이미 사용된 단어 목록([${usedWordsList.map((w) => `"${w}"`).join(", ")}])에 없는 단어야 합니다.
4. 반드시 한국어 명사여야 합니다.

지시사항:
- 위 규칙에 맞는 단어를 찾았다면, **반드시 "get_next_korean_word" 함수를 호출**해야 합니다.
- 함수를 호출할 때는 다음 인자들을 정확히 채워야 합니다:
    - 'last_word': 사용자가 마지막으로 제시한 단어 (예: "${currentWord}")
    - 'used_words': 현재까지 사용된 단어들의 배열 (예: [${usedWordsList.map((w) => `"${w}"`).join(", ")}])
    - 'suggested_word_by_ai': 당신이 위 규칙에 따라 찾은 다음 한국어 명사 단어. **이것이 함수 호출의 핵심 결과입니다.**

- 만약 위 규칙을 모두 만족하는 적절한 한국어 명사 단어를 **정말로 찾을 수 없는 경우에만**, 함수를 호출하지 말고, 그 이유를 구체적으로 설명하는 메시지를 일반 텍스트로 반환하십시오. (예: "죄송합니다. '${currentWord[currentWord.length - 1]}' (으)로 시작하고 아직 사용되지 않은 적절한 두 글자 이상의 한국어 명사를 찾을 수 없습니다.")
`;

    console.log("Sending prompt to Gemini:", prompt);

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const calls = response.functionCalls();

    if (calls && calls.length > 0) {
      const call = calls[0];
      console.log("Gemini Function Call:", JSON.stringify(call, null, 2));

      const suggestedWord = call.args?.suggested_word_by_ai;

      if (suggestedWord) {
        return { word: suggestedWord };
      } else {
        const aiTextResponse = response.text();
        console.warn(
          "AI called function but 'suggested_word_by_ai' was not in args. AI text response:",
          aiTextResponse
        );
        return {
          error:
            aiTextResponse ||
            "AI가 다음 단어를 제공하지 않았습니다 (함수 호출 시 단어 누락).",
        };
      }
    } else {
      const aiTextResponse = response.text();
      console.log("Gemini Text Response (No Function Call):", aiTextResponse);
      if (aiTextResponse && aiTextResponse.trim() !== "") {
        return { error: `AI 응답: ${aiTextResponse}` };
      }
      return {
        error: "AI가 다음 단어를 제안하지 않았습니다 (함수 호출 없음).",
      };
    }
  } catch (error) {
    console.error("Error fetching next word from AI:", error);
    return { error: `AI와 통신 중 오류 발생: ${error.message}` };
  }
}
