import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SimpleBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function SimpleBottomSheet({ open, onClose, children, title }: SimpleBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    };
    
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('click', handleOutsideClick);
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [open, onClose]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
      />
      
      <div 
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl bg-white p-6"
        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
      >
        <div className="relative">
          <div className="bottom-sheet-handle mb-4 mx-auto"></div>
          
          {title && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{title}</h2>
              <button 
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          <div 
            ref={sheetRef} 
            className="pt-1"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}