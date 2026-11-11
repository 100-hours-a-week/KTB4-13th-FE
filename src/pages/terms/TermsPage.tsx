import { CONTACT_EMAIL } from "@/common/lib/serviceInfo";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

const EFFECTIVE_DATE = "2026년 11월 13일";
const CLAUSE_MARKERS = ["①", "②", "③", "④", "⑤"];

interface TermsArticle {
  clauses: string[];
  title: string;
}

// Only rules the running service actually follows belong here; point amounts and other numbers that the
// BE may change are left to the screens that show them (checked against KTB4-13th-BE at 2026-11-11).
const TERMS_ARTICLES: TermsArticle[] = [
  {
    title: "목적",
    clauses: [
      "이 약관은 북적북적(이하 “서비스”)을 이용하는 조건과 절차, 이용자와 서비스 운영 팀의 권리와 의무를 정합니다.",
    ],
  },
  {
    title: "서비스의 성격",
    clauses: [
      "북적북적은 개발 교육 과정에서 팀 프로젝트로 만들어 운영하는 테스트 서비스입니다.",
      "서비스의 결제는 테스트 결제입니다. 결제해도 실제로 돈이 청구되지 않고, 주문한 책은 배송되지 않습니다.",
      "서비스 안의 포인트와 쿠폰은 테스트용입니다. 현금으로 바꾸거나 충전하거나 다른 사람에게 넘길 수 없습니다.",
    ],
  },
  {
    title: "회원 가입과 계정",
    clauses: [
      "회원은 카카오 계정으로 로그인해 가입합니다.",
      "만 14세 미만은 가입할 수 없습니다.",
      "처음 로그인한 뒤 독서 취향 질문(온보딩)을 마쳐야 서비스를 이용할 수 있습니다.",
      "닉네임에 다른 사람의 이름을 사칭하거나 다른 사람의 권리를 침해하는 표현을 쓸 수 없습니다.",
    ],
  },
  {
    title: "AI 추천과 답변",
    clauses: [
      "책 추천 대화, 추천 이유, 장바구니 담기 제안 등 일부 기능은 생성형 인공지능(AI)이 만듭니다.",
      "AI가 만든 내용은 틀리거나 실제 책 정보와 다를 수 있습니다. 책을 담거나 주문하기 전에 책 정보를 확인해 주세요.",
      "대화창에 연락처, 주소, 주민등록번호 같은 개인정보를 입력하지 마세요.",
    ],
  },
  {
    title: "책 정보",
    clauses: [
      "책 정보는 국립중앙도서관과 도서관 정보나루 등 공개 자료에서 가져옵니다. 일부 정보는 빠져 있거나 실제와 다를 수 있습니다.",
    ],
  },
  {
    title: "주문과 취소",
    clauses: [
      "주문은 테스트 결제로 처리합니다.",
      "구매를 확정하기 전의 주문 상품은 취소할 수 있습니다. 구매를 확정한 상품은 취소할 수 없습니다.",
    ],
  },
  {
    title: "후기",
    clauses: [
      "다른 사람을 비방하거나 개인정보를 드러내는 등 다른 사람의 권리를 침해하는 후기는 가리거나 삭제할 수 있습니다.",
      "탈퇴한 뒤에도 작성한 후기는 남고, 작성자는 ‘탈퇴 회원’으로 표시됩니다. 남기고 싶지 않은 후기는 탈퇴하기 전에 삭제해 주세요.",
    ],
  },
  {
    title: "탈퇴",
    clauses: [
      "마이페이지에서 언제든 탈퇴를 신청할 수 있습니다.",
      "신청한 뒤 7일 안에 다시 로그인하면 탈퇴가 취소됩니다. 7일이 지나면 탈퇴가 완료됩니다.",
    ],
  },
  {
    title: "서비스 변경과 종료",
    clauses: [
      "서비스는 교육 과정 프로젝트로 운영되므로 기능이 바뀌거나 운영이 끝날 수 있습니다. 운영을 끝낼 때는 미리 서비스 화면에 알립니다.",
    ],
  },
  {
    title: "약관 변경",
    clauses: [
      "약관을 바꿀 때는 바뀌는 내용과 시행일을 시행 7일 전부터 서비스 화면에 알립니다.",
    ],
  },
  {
    title: "문의",
    clauses: [`서비스 이용에 관한 문의는 ${CONTACT_EMAIL}로 보내 주세요.`],
  },
];

export function TermsPage() {
  return (
    <div className="flex h-dvh min-w-0 flex-col bg-surface">
      <AppPageHeader fallbackPath="/" showCart={false} title="이용약관" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto pb-10 pt-6">
        <h2 className="type-heading text-text-primary">북적북적 이용약관</h2>
        <p className="mt-1 type-caption text-text-tertiary">시행일 {EFFECTIVE_DATE}</p>

        <div className="mt-5 rounded-panel bg-muted px-4 py-3 break-keep type-body-small text-text-secondary">
          북적북적은 테스트 결제로 운영하는 서비스예요. 결제해도 실제로 돈이 나가지 않고, 주문한 책도 배송되지 않아요.
        </div>

        <ol className="mt-6 flex flex-col gap-6">
          {TERMS_ARTICLES.map((article, articleIndex) => (
            <li key={article.title}>
              <h3 className="type-title text-text-primary">
                제{articleIndex + 1}조 ({article.title})
              </h3>
              {article.clauses.length === 1 ? (
                <p className="mt-2 break-keep type-body-small text-text-secondary">
                  {article.clauses[0]}
                </p>
              ) : (
                <ol className="mt-2 flex flex-col gap-1.5">
                  {article.clauses.map((clause, clauseIndex) => (
                    <li
                      className="flex gap-1.5 break-keep type-body-small text-text-secondary"
                      key={clause}
                    >
                      <span aria-hidden="true" className="shrink-0 tabular-nums">
                        {CLAUSE_MARKERS[clauseIndex]}
                      </span>
                      <span>{clause}</span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-hairline pt-4 type-caption text-text-tertiary">
          부칙: 이 약관은 {EFFECTIVE_DATE}부터 시행합니다.
        </p>
      </main>
    </div>
  );
}
