export type LoginStatus =
  | "idle"
  | "loading"
  | "cancelled"
  | "network-error"
  | "server-error"
  | "success";

export type LoginFeedback =
  | {
      kind: "cancelled";
      message: "로그인이 취소되었어요";
    }
  | {
      kind: "network-error";
      message: "네트워크 연결을 확인하고 다시 시도해 주세요";
    }
  | {
      kind: "server-error";
      message: "지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요";
    };
