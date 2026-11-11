// 서지 제목은 앞에 붙는 말을 괄호로 묶어 둔다: "(그림으로 배우는) 리눅스"(책의 약 9.5%).
// 서점은 같은 책을 "그림으로 배우는 리눅스"로 보여 주므로, 화면에서는 맨 앞 괄호만 벗긴다.
// 글자는 지우지 않는다. <진중문고>·[개정판]·『』처럼 판본이나 제목의 일부인 괄호와,
// 괄호가 겹치거나 닫히지 않은 제목은 그대로 둔다. API로 보내는 값에는 쓰지 않는다.
const LEADING_PARENTHESES = /^\(([^()]+)\)\s*(.*)$/;

export function displayBookTitle(title: string) {
  const match = LEADING_PARENTHESES.exec(title.trim());

  if (!match) {
    return title;
  }

  const prefix = match[1].trim();
  const rest = match[2].trim();

  if (!prefix) {
    return title;
  }

  return rest ? `${prefix} ${rest}` : prefix;
}
