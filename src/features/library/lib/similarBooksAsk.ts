// 마지막 글자에 받침이 있는가. AI 의 app/chat/options.py has_object_final 과 같은 규칙이다
// (숫자는 읽는 소리로 본다: 영·일·삼·육·칠·팔은 받침)
function hasFinalConsonant(word: string) {
  const last = word.trimEnd().slice(-1);
  if (last >= "가" && last <= "힣") return (last.charCodeAt(0) - "가".charCodeAt(0)) % 28 !== 0;
  return "013678".includes(last) && last !== "";
}

// 북적이에게 보낼 "비슷한 책" 질문. 북적이 답 보기 버튼과 같은 문장이라 그 책을 기준으로 비슷한 책을 고른다
export function similarBooksAsk(title: string) {
  return `『${title}』${hasFinalConsonant(title) ? "과" : "와"} 비슷한 책 더 보여줘`;
}
