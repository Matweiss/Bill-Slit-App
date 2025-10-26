import React, { useState } from 'react';
import { SendIcon, MicrophoneIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const { isListening, toggleListening, hasSupport } = useSpeechRecognition({
    onTranscript: (transcript) => setMessage(transcript),
  });

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow bg-white">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="e.g., Sarah had the salad"
        className="w-full p-3 border-none focus:ring-0 rounded-l-lg bg-transparent"
        disabled={isLoading}
      />
      {hasSupport && (
          <button
              type="button"
              onClick={toggleListening}
              aria-label={isListening ? 'Stop listening' : 'Start listening for chat message'}
              className={`p-3 transition-colors ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
              <MicrophoneIcon className="w-6 h-6" />
          </button>
      )}
      <button onClick={handleSend} disabled={isLoading || !message.trim()} className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
        <SendIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatInput;