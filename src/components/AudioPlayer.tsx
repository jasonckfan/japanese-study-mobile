import React from 'react';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import type { AudioSegment } from '../hooks/useScenarioAudio';

interface AudioPlayerProps {
  isOpen: boolean;
  scenarioTitle: string;
  segments: AudioSegment[];
  isPlaying: boolean;
  currentIndex: number;
  onClose: () => void;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (index: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isOpen,
  scenarioTitle,
  segments,
  isPlaying,
  currentIndex,
  onClose,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
}) => {
  if (!isOpen) return null;

  const currentSegment = segments[currentIndex];
  const progress = segments.length > 0 ? ((currentIndex + 1) / segments.length) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              🔊 {scenarioTitle}
            </span>
            <span className="text-xs text-gray-500">
              ({currentIndex + 1}/{segments.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="關閉播放器"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Current Text Display */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3 min-h-[60px]">
          {currentSegment ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                {currentSegment.speaker && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {currentSegment.speaker}
                  </span>
                )}
              </div>
              <p className="text-gray-800 font-medium">{currentSegment.text}</p>
              {currentSegment.textCn && (
                <p className="text-gray-500 text-sm mt-1">{currentSegment.textCn}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center">點擊播放開始</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>進度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Segment dots for seeking */}
          <div className="flex justify-between mt-2 px-1">
            {segments.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSeek(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-blue-500 scale-125'
                    : idx < currentIndex
                    ? 'bg-blue-300'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`跳轉到第 ${idx + 1} 句`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrevious}
            disabled={currentIndex <= 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="上一句"
          >
            <SkipBack size={24} className="text-gray-700" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            aria-label={isPlaying ? '暫停' : '播放'}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button
            onClick={onNext}
            disabled={currentIndex >= segments.length - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="下一句"
          >
            <SkipForward size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Segment List (collapsible, shown when not playing) */}
        {!isPlaying && segments.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto border-t border-gray-100 pt-3">
            <div className="space-y-2">
              {segments.map((segment, idx) => (
                <button
                  key={idx}
                  onClick={() => onSeek(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    idx === currentIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="font-medium mr-2">{idx + 1}.</span>
                  <span className="truncate">{segment.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
