import { useEffect, useRef } from "react";

interface PhotoPreviewProps {
  alt: string;
  className: string;
  photo: Blob;
}

// 고른 사진 파일을 바로 보여 준다. 화면을 떠나거나 사진이 바뀌면 임시 주소를 돌려준다
export function PhotoPreview({ alt, className, photo }: PhotoPreviewProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const url = URL.createObjectURL(photo);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return <img alt={alt} className={className} ref={imageRef} />;
}
