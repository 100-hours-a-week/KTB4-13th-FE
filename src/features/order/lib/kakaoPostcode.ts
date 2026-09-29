const KAKAO_POSTCODE_SCRIPT_ID = "kakao-postcode-script";
const KAKAO_POSTCODE_SCRIPT_URL =
  "//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export interface KakaoPostcodeData {
  jibunAddress: string;
  roadAddress: string;
  userSelectedType: "J" | "R";
  zonecode: string;
}

interface KakaoPostcodeOptions {
  oncomplete: (data: KakaoPostcodeData) => void;
}

interface KakaoPostcodeOpenOptions {
  popupKey: string;
  popupTitle: string;
}

interface KakaoPostcodeInstance {
  open: (options?: KakaoPostcodeOpenOptions) => void;
}

interface KakaoPostcodeConstructor {
  new (options: KakaoPostcodeOptions): KakaoPostcodeInstance;
}

type WindowWithKakaoPostcode = Window & {
  kakao?: {
    Postcode?: KakaoPostcodeConstructor;
  };
};

let loaderPromise: Promise<KakaoPostcodeConstructor> | null = null;

function getPostcodeConstructor() {
  return (window as WindowWithKakaoPostcode).kakao?.Postcode ?? null;
}

export function loadKakaoPostcode(): Promise<KakaoPostcodeConstructor> {
  const loadedConstructor = getPostcodeConstructor();

  if (loadedConstructor) {
    return Promise.resolve(loadedConstructor);
  }
  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<KakaoPostcodeConstructor>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `#${KAKAO_POSTCODE_SCRIPT_ID}`,
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      const Postcode = getPostcodeConstructor();

      if (Postcode) {
        resolve(Postcode);
        return;
      }

      loaderPromise = null;
      script.remove();
      reject(new Error("Kakao Postcode constructor is unavailable."));
    };

    const handleError = () => {
      loaderPromise = null;
      script.remove();
      reject(new Error("Failed to load Kakao Postcode script."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = KAKAO_POSTCODE_SCRIPT_ID;
      script.src = KAKAO_POSTCODE_SCRIPT_URL;
      document.head.append(script);
    }
  });

  return loaderPromise;
}

export async function openKakaoPostcode(
  onComplete: (data: KakaoPostcodeData) => void,
) {
  const Postcode = await loadKakaoPostcode();

  new Postcode({ oncomplete: onComplete }).open({
    popupKey: "bookjeok-order-postcode",
    popupTitle: "우편번호 검색",
  });
}

export function getPostcodeAddress(data: KakaoPostcodeData) {
  const selectedAddress =
    data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

  return data.roadAddress || selectedAddress || data.jibunAddress;
}
