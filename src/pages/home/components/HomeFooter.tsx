const PROJECT_REPOSITORY_URL = "https://github.com/100-hours-a-week/KTB4-13th-wiki";
const DATA4LIBRARY_URL = "https://data4library.kr/";

const LINK_CLASS_NAME =
  "underline underline-offset-2 hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// Business registration, terms and a contact address are left out on purpose: the service has no business
// operator yet, the policy texts are internal drafts, and no contact address has been decided (FS-4 6.3).
export function HomeFooter() {
  return (
    <footer className="page-content mt-3 border-t border-hairline pt-6 pb-2">
      <p className="font-brand text-lg text-text-primary">북적북적</p>
      <p className="mt-1 break-keep type-caption text-text-secondary">
        대화 몇 마디로 지금 나에게 맞는 책을 찾아드려요
      </p>

      <div className="mt-4 rounded-panel bg-muted px-4 py-3">
        <p className="type-caption font-semibold text-text-secondary">
          테스트 결제로 운영하는 서비스예요
        </p>
        <p className="mt-1 break-keep type-caption text-text-tertiary">
          결제해도 실제로 돈이 나가지 않아요.
          <br />
          주문한 책도 배송되지 않아요.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 break-keep type-caption text-text-tertiary">
        <p>
          개발 교육 과정의 팀 프로젝트로 만들었어요.{" "}
          <a
            className={LINK_CLASS_NAME}
            href={PROJECT_REPOSITORY_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </p>
        <p>
          본 사이트는 국립중앙도서관{" "}
          <a
            className={LINK_CLASS_NAME}
            href={DATA4LIBRARY_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            도서관 정보나루
          </a>
          의 API 데이터를 활용하고 있습니다.
        </p>
      </div>

      <p className="mt-4 type-caption text-text-tertiary">© 2026 북적북적</p>
    </footer>
  );
}
