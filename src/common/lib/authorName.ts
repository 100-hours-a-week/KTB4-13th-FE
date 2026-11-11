// 저자 이름을 비교할 때 쓰는 모양. 띄어쓰기·대소문자·유니코드 조합 차이만 없앤다(이름이 같으면 같은 저자로 본다)
export function normalizeAuthor(author: string) {
  return author.trim().normalize("NFC").replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

// 제목을 비교할 때 쓰는 모양. 띄어쓰기·유니코드 조합 차이만 없앤다
export function normalizeTitle(title: string) {
  return title.trim().normalize("NFC").replace(/\s+/g, " ");
}

// 같은 책의 다른 판본을 묶는 열쇠. 끝에 붙은 괄호 말("(리커버)", "[양장]")을 떼고 비교한다
export function editionKey(title: string) {
  let key = normalizeTitle(title);
  for (let previous = ""; previous !== key;) {
    previous = key;
    key = key.replace(/\s*[([][^()[\]]*[)\]]$/, "");
  }
  return key || normalizeTitle(title);
}
