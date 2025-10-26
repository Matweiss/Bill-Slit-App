import React, { useRef, useState } from 'react';
import { UploadIcon, CameraIcon } from './icons';
import CameraCapture from './CameraCapture';

interface ReceiptUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const supportsCamera = typeof navigator !== 'undefined' && 'mediaDevices' in navigator;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleCapture = (file: File) => {
    setIsCameraOpen(false);
    onImageUpload(file);
  };

  return (
    <>
      {isCameraOpen && (
        <CameraCapture 
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
        />
      )}
      <div className="w-full max-w-2xl mx-auto">
        <div 
          className="bg-white rounded-xl shadow-lg border-2 border-dashed border-slate-300 hover:border-slate-400 transition-all duration-300 p-8 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
              <p className="mt-4 text-slate-600 font-semibold">Analyzing your receipt...</p>
              <p className="text-sm text-slate-500">This might take a moment.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600">
              <UploadIcon className="w-12 h-12 mb-4 text-slate-400" />
              <p className="font-semibold text-slate-700 mb-2">
                Drag and drop a receipt image here
              </p>
              <div className="flex items-center my-4 w-full">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase">Or</span>
                <div className="flex-grow border-t border-slate-300"></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                  onClick={handleClick}
                  className="flex-1 flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Choose File
                </button>
                {supportsCamera && (
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 flex items-center justify-center w-full px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                  >
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Take Photo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReceiptUploader;