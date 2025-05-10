import { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Contrast, 
  CropIcon, 
  Check, 
  RefreshCw, 
  X
} from 'lucide-react';

interface ImageEditorProps {
  imageFile: File;
  onCancel: () => void;
  onConfirm: (editedImageFile: File) => void;
}

export default function ImageEditor({ imageFile, onCancel, onConfirm }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 이미지 로드 및 캔버스에 초기 렌더링
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      imageRef.current = img;
      renderCanvas();
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }, [imageFile]);
  
  // 캔버스에 현재 설정값으로 이미지를 렌더링
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 크기 설정
    let width = img.width;
    let height = img.height;
    
    // 너무 큰 이미지 처리 (최대 1000px로 제한)
    const maxDimension = 1000;
    if (width > maxDimension || height > maxDimension) {
      const ratio = width / height;
      if (width > height) {
        width = maxDimension;
        height = width / ratio;
      } else {
        height = maxDimension;
        width = height * ratio;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 회전을 위한 설정
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // 줌 설정
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;
    
    // 이미지 그리기
    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
    
    // 필터 적용
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)`;
    
    // 이미지 다시 그리기
    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
    
    ctx.restore();
  };
  
  // 설정값 변경 시 캔버스 다시 렌더링
  useEffect(() => {
    renderCanvas();
  }, [zoom, rotation, brightness, contrast, grayscale]);
  
  // 확대 버튼 핸들러
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 3));
  };
  
  // 축소 버튼 핸들러
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };
  
  // 시계 방향 회전 핸들러
  const handleRotateRight = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };
  
  // 시계 반대 방향 회전 핸들러
  const handleRotateLeft = () => {
    setRotation(prevRotation => (prevRotation - 90 + 360) % 360);
  };
  
  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setZoom(1);
    setRotation(0);
  };
  
  // 모든 값 단계별로 조정하는 공통 핸들러
  const handleSliderChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number
  ) => {
    const value = parseInt(event.target.value, 10);
    setter(Math.max(min, Math.min(max, value)));
  };
  
  // 확인 버튼 핸들러
  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // 캔버스 이미지를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('이미지 변환 실패');
          }
        }, 'image/jpeg', 0.9); // 90% 퀄리티의 JPEG로 변환
      });
      
      // 새 File 객체 생성
      const editedFile = new File(
        [blob],
        `edited_${imageFile.name}`,
        { type: 'image/jpeg' }
      );
      
      onConfirm(editedFile);
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          className="rounded-full p-2 hover:bg-gray-100"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-medium">이미지 편집</h2>
        <button 
          className="rounded-full bg-primary text-white p-2"
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Check size={20} />}
        </button>
      </div>
      
      {/* 이미지 편집 영역 */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        <div className="relative overflow-hidden max-w-full max-h-full">
          <canvas 
            ref={canvasRef} 
            className="max-w-full max-h-[calc(100vh-200px)] object-contain border border-gray-300 rounded-lg shadow-md"
          />
        </div>
      </div>
      
      {/* 하단 편집 도구 */}
      <div className="border-t bg-white p-4">
        <div className="space-y-4">
          {/* 줌 및 회전 컨트롤 */}
          <div className="flex justify-around">
            <button 
              className="p-3 rounded-full hover:bg-gray-100"
              onClick={handleZoomOut}
            >
              <ZoomOut size={20} />
            </button>
            <button 
              className="p-3 rounded-full hover:bg-gray-100"
              onClick={handleZoomIn}
            >
              <ZoomIn size={20} />
            </button>
            <button 
              className="p-3 rounded-full hover:bg-gray-100"
              onClick={handleRotateLeft}
            >
              <RotateCcw size={20} />
            </button>
            <button 
              className="p-3 rounded-full hover:bg-gray-100"
              onClick={handleRotateRight}
            >
              <RotateCw size={20} />
            </button>
            <button 
              className="p-3 rounded-full hover:bg-gray-100 text-red-500"
              onClick={handleResetFilters}
            >
              <RefreshCw size={20} />
            </button>
          </div>
          
          {/* 밝기 슬라이더 */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">밝기</span>
              <span className="text-sm text-gray-500">{brightness}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={brightness}
              onChange={(e) => handleSliderChange(e, setBrightness, 20, 200)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* 대비 슬라이더 */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">대비</span>
              <span className="text-sm text-gray-500">{contrast}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={contrast}
              onChange={(e) => handleSliderChange(e, setContrast, 20, 200)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* 흑백 슬라이더 - 문자 인식에 효과적 */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">흑백 효과</span>
              <span className="text-sm text-gray-500">{grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={grayscale}
              onChange={(e) => handleSliderChange(e, setGrayscale, 0, 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* 텍스트 추출 팁 */}
          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
            <p className="font-medium mb-1">텍스트 추출 팁:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>흑백 효과를 높이면 텍스트 인식률이 향상될 수 있습니다</li>
              <li>대비를 높이면 텍스트와 배경 구분이 명확해집니다</li>
              <li>이미지가 흐릿한 경우 밝기를 조절해보세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}