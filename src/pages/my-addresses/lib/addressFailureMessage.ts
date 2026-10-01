import type { AddressMutationResult } from "@/features/address/api/addressApi";

type AddressFailureReason = Extract<AddressMutationResult, { ok: false }>["reason"];

// 400 cannot tell a duplicate from invalid input, so the message names both without guessing.
export function getAddressFailureMessage(reason: AddressFailureReason) {
  if (reason === "not-found") {
    return "배송지를 찾을 수 없어요. 목록을 다시 불러올게요";
  }
  if (reason === "invalid-request") {
    return "배송지를 저장하지 못했어요. 이미 같은 배송지가 있는지, 입력값이 맞는지 확인해 주세요";
  }
  return "요청을 처리하지 못했어요. 다시 시도해 주세요";
}
