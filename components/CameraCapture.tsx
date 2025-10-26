import React, { useRef, useEffect, useCallback } from 'react';
import { XIcon } from './icons';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Prefer rear camera
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Could not access the camera. Please ensure you have granted permission.");
        onClose();
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, [onClose, stopCamera]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.95);
      }
      stopCamera();
    }
  }, [onCapture, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain" 
        autoPlay 
        playsInline 
        muted
        aria-label="Live camera feed"
      ></video>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
      
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
        aria-label="Close camera"
      >
        <XIcon className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 flex items-center justify-center w-full">
        <button 
          onClick={handleCapture} 
          className="w-20 h-20 rounded-full bg-white ring-4 ring-white ring-opacity-50 hover:ring-opacity-75 focus:outline-none focus:ring-opacity-100 transition-all flex items-center justify-center"
          aria-label="Capture photo"
        >
            <div className="w-16 h-16 rounded-full bg-white border-4 border-black"></div>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
