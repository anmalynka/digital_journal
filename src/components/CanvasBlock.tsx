import React, { useRef, useEffect, useState } from 'react';
import { Block } from '../lib/db';
import { useJournal } from '../context/JournalContext';
import { Eraser, PenTool, Trash2 } from 'lucide-react';

interface CanvasBlockProps {
  block: Block;
}

const CanvasBlock: React.FC<CanvasBlockProps> = ({ block }) => {
  const { updateBlock } = useJournal();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 400 * 2; // Fixed height for canvas blocks
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `400px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = '#2f3e46';
    context.lineWidth = 2;
    contextRef.current = context;

    // Load existing data if available
    if (block.canvasData) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, rect.width, 400);
      };
      img.src = block.canvasData;
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (tool === 'eraser') {
      contextRef.current!.globalCompositeOperation = 'destination-out';
      contextRef.current!.lineWidth = 20;
    } else {
      contextRef.current!.globalCompositeOperation = 'source-over';
      contextRef.current!.lineWidth = 2;
      contextRef.current!.strokeStyle = '#2f3e46';
    }

    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveCanvas();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ('nativeEvent' in e && e.nativeEvent instanceof MouseEvent) {
      return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    } else {
      const touch = (e as React.TouchEvent).touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        offsetX: touch.clientX - (rect?.left || 0),
        offsetY: touch.clientY - (rect?.top || 0)
      };
    }
  };

  const saveCanvas = () => {
    const dataURL = canvasRef.current?.toDataURL();
    if (dataURL && dataURL !== block.canvasData) {
      updateBlock({ ...block, canvasData: dataURL });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    saveCanvas();
  };

  return (
    <div className="relative w-full group/canvas">
      <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
        <button 
          onClick={() => setTool('pen')}
          className={`p-2 rounded-xl shadow-lg border transition-all ${tool === 'pen' ? 'bg-[#6b705c] text-white' : 'bg-white text-gray-400'}`}
        >
          <PenTool className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-xl shadow-lg border transition-all ${tool === 'eraser' ? 'bg-[#6b705c] text-white' : 'bg-white text-gray-400'}`}
        >
          <Eraser className="w-4 h-4" />
        </button>
        <button 
          onClick={clearCanvas}
          className="p-2 bg-white text-red-400 rounded-xl shadow-lg border hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-[400px] bg-white/50 rounded-[2rem] border border-black/5 cursor-crosshair touch-none"
      />
      
      <div className="mt-2 text-[9px] font-black text-[#a5a58d] uppercase tracking-[0.2em] text-center">
        Sketchpad • Analog Synthesis
      </div>
    </div>
  );
};

export default CanvasBlock;
