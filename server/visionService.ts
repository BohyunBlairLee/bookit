import vision from '@google-cloud/vision';
import { ImageAnnotatorClient } from '@google-cloud/vision';

/**
 * Google Cloud Vision API를 사용하여 이미지에서 텍스트를 추출하는 서비스
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // API Key만 사용하여 클라이언트 초기화
    const client = new ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    });

    // 이미지 버퍼로 텍스트 감지 요청
    const [result] = await client.textDetection({
      image: { content: imageBuffer }
    });

    // 추출된 텍스트 반환
    const detections = result.textAnnotations || [];
    if (detections.length > 0 && detections[0].description) {
      return detections[0].description;
    }

    console.log("No text detected in the image");
    return '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    // 구체적인 에러 메시지를 포함
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`텍스트 추출 중 오류가 발생했습니다: ${errorMessage}`);
  }
}

/**
 * 이미지에서 추출한 텍스트를 가공하는 함수
 * 줄바꿈을 정리하고 필요한 전처리를 수행
 */
export function processExtractedText(text: string): string {
  return text
    .replace(/\n+/g, ' ')  // 여러 줄바꿈을 공백으로 변환
    .replace(/\s+/g, ' ')  // 여러 공백을 하나로 변환
    .trim();               // 앞뒤 공백 제거
}