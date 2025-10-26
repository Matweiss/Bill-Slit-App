import React, { useState } from 'react';
import { XIcon, MicrophoneIcon } from './icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import ReceiptUploader from './ReceiptUploader';

interface NewBillCreatorProps {
  newBillDiners: string[];
  onAddDiner: (name: string) => void;
  onRemoveDiner: (name: string) => void;
  frequentDiners: string[];
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const NewBillCreator: React.FC<NewBillCreatorProps> = ({
  newBillDiners, onAddDiner, onRemoveDiner, frequentDiners,
  onImageUpload, isLoading
}) => {
  const [newName, setNewName] = useState('');
  
  const { isListening, toggleListening, hasSupport } = useSpeechRecognition({
    onTranscript: (transcript) => setNewName(transcript)
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddDiner(newName.trim());
      setNewName('');
    }
  };
  
  const unusedFrequentDiners = frequentDiners.filter(d => !newBillDiners.includes(d));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Prepare a New Bill</h2>
      
      <div className="space-y-4">
        {/* Step 1: Diner Input */}
        <div>
          <label className="block text-lg font-bold text-slate-700 mb-2">
            Step 1: Add Diners
          </label>
          <form onSubmit={handleAdd} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add diner name"
              className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="New diner name"
            />
            {hasSupport && (
                <button
                    type="button"
                    onClick={toggleListening}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                    className={`p-2 border rounded-lg transition-colors flex-shrink-0 ${
                        isListening ? 'bg-red-100 text-red-600 ring-2 ring-red-300 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
            )}
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex-shrink-0">
              Add
            </button>
          </form>
          <div className="p-3 bg-slate-50 rounded-lg min-h-[52px] border">
            <div className="flex flex-wrap gap-2">
              {newBillDiners.length > 0 ? newBillDiners.map(diner => (
                <div 
                    key={diner} 
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-700"
                >
                  <span>{diner}</span>
                  <button onClick={() => onRemoveDiner(diner)} className="text-slate-500 hover:text-slate-800" aria-label={`Remove ${diner}`}>
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              )) : <p className="text-sm text-slate-500 px-1 py-1">Add diners to begin.</p>}
            </div>
          </div>
        </div>

        {/* Frequent Diners */}
        {unusedFrequentDiners.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-md font-bold text-slate-600 mb-2">Frequent Diners</h4>
            <div className="flex flex-wrap gap-2">
              {unusedFrequentDiners.map(diner => (
                <button
                  key={diner}
                  onClick={() => onAddDiner(diner)}
                  className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full hover:bg-teal-200"
                >
                  + {diner}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Uploader */}
        <div className="pt-4 border-t">
          <label className="block text-lg font-bold text-slate-700 mb-2">
            Step 2: Upload Receipt
          </label>
          <ReceiptUploader onImageUpload={onImageUpload} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default NewBillCreator;