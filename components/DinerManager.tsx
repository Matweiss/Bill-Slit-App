import React, { useState } from 'react';
import { XIcon, MicrophoneIcon, UsersIcon, DivideSquareIcon } from './icons';
import { Bill } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface DinerManagerProps {
  bill: Bill;
  onAddDiner: (name: string) => void;
  onRemoveDiner: (name: string) => void;
  onAssignItem: (itemId: number, personNames: string[]) => void;
  onSplitEvenly: () => void;
  onAddDinerToAllItems: (name: string) => void;
}

const DinerManager: React.FC<DinerManagerProps> = ({ 
    bill, onAddDiner, onRemoveDiner, onAssignItem,
    onSplitEvenly, onAddDinerToAllItems
}) => {
  const [newName, setNewName] = useState('');
  const [dragOverDiner, setDragOverDiner] = useState<string | null>(null);
  const { diners, assignments, parsedReceipt } = bill;

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

  const handleDrop = (dinerName: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(itemId)) {
      const currentAssignment = assignments.find(a => a.itemId === itemId);
      const currentNames = currentAssignment ? currentAssignment.personNames : [];
      const newNames = new Set([...currentNames, dinerName]);
      onAssignItem(itemId, Array.from(newNames));
    }
    setDragOverDiner(null);
  };

  const handleDragOver = (dinerName: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDiner(dinerName);
  };

  const handleDragLeave = () => setDragOverDiner(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-700">Diners</h3>
        <button
          onClick={onSplitEvenly}
          disabled={diners.length < 2}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
          title="Assign all items to all diners"
        >
          <DivideSquareIcon className="w-4 h-4" />
          Split Evenly
        </button>
      </div>

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
                aria-label={isListening ? 'Stop listening' : 'Start listening for diner name'}
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
      <div className="flex flex-wrap gap-2 min-h-[38px]">
        {diners.length > 0 ? diners.map(diner => {
          const allItemIds = parsedReceipt?.items.map(i => i.id) ?? [];
          const isDinerOnAllItems = allItemIds.length > 0 && allItemIds.every(itemId =>
              assignments.find(a => a.itemId === itemId)?.personNames.includes(diner)
          );
          
          return (
            <div
              key={diner}
              onDrop={handleDrop(diner)}
              onDragOver={handleDragOver(diner)}
              onDragLeave={handleDragLeave}
              className={`flex items-center rounded-full text-sm font-medium transition-all duration-200 group
                ${dragOverDiner === diner ? 'bg-indigo-200 ring-2 ring-indigo-500' : 'bg-slate-200 text-slate-700'}
              `}
              role="button"
              aria-label={`Drop target for ${diner}`}
            >
              <span className="pl-3 pr-1 py-1">{diner}</span>
              <button
                onClick={() => onAddDinerToAllItems(diner)}
                disabled={isDinerOnAllItems}
                title={`Assign all items to ${diner}`}
                className="p-1 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                aria-label={`Assign all items to ${diner}`}
              >
                  <UsersIcon className="w-4 h-4" />
              </button>
              <button 
                  onClick={() => onRemoveDiner(diner)} 
                  className="pr-2 pl-1 py-1 text-slate-500 hover:text-red-600"
                  aria-label={`Remove ${diner}`}
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          )
        }) : <p className="text-sm text-slate-500 px-3 py-1">Add some diners to get started!</p>}
      </div>
    </div>
  );
};

export default DinerManager;