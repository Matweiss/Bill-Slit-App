import React, { useState } from 'react';
import { PersonTotal, Assignment, ReceiptData } from '../types';
import { ChevronDownIcon, CheckCircleIcon } from './icons';

interface SummaryViewProps {
  totals: PersonTotal[];
  dinerTips: { [key: string]: number };
  onDinerTipChange: (name: string, percentage: number) => void;
  receipt: ReceiptData;
  assignments: Assignment[];
  settlementStatus: { [key: string]: boolean };
  onToggleSettlement: (name: string) => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ 
    totals, dinerTips, onDinerTipChange, receipt, assignments, 
    settlementStatus, onToggleSettlement 
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const getItemsForPerson = (personName: string) => {
        return assignments
            .filter(a => a.personNames.includes(personName))
            .map(a => {
                const item = receipt.items.find(i => i.id === a.itemId);
                return { ...item, assignment: a };
            })
            .filter(item => item.id !== undefined);
    };
    
    return (
        <div className="mt-6 border-t pt-4">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                aria-expanded={isExpanded}
                aria-controls="summary-details"
            >
                <h3 className="text-xl font-bold text-slate-800">Who Owes What</h3>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            
            {isExpanded && (
                <div id="summary-details" className="mt-4">
                    {totals.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">Assign items to see the breakdown.</p>
                    ) : (
                        <ul className="space-y-4">
                            {totals.map(person => {
                                const tipPercentage = dinerTips[person.name] ?? 18;
                                const personItems = getItemsForPerson(person.name);
                                const isSettled = settlementStatus[person.name] || false;

                                return (
                                    <li key={person.name} className={`p-4 bg-slate-50 rounded-lg transition-opacity ${isSettled ? 'opacity-60' : ''}`}>
                                        <div className="flex justify-between items-center font-bold mb-2">
                                            <div className="flex items-center gap-2">
                                                {isSettled && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                                <span className="text-lg text-slate-800">{person.name}</span>
                                            </div>
                                            <span className="text-lg font-mono text-indigo-600">${(person.subtotal + person.tax).toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="space-y-1 text-sm text-slate-600 mb-3">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span className="font-mono">${person.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tax</span>
                                                <span className="font-mono">${person.tax.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {personItems.length > 0 && (
                                            <div className="mb-3 border-t pt-2 mt-2">
                                                <h4 className="text-sm font-semibold text-slate-700 mb-1">Items:</h4>
                                                <ul className="space-y-1 text-xs pl-2">
                                                    {personItems.map(itemData => {
                                                        if (!itemData.id) return null;
                                                        const shareCount = itemData.assignment.personNames.length;
                                                        const pricePerPerson = itemData.price / shareCount;
                                                        const otherDiners = itemData.assignment.personNames.filter(name => name !== person.name);

                                                        return (
                                                            <li key={`${person.name}-${itemData.id}`} className="flex justify-between items-center text-slate-500">
                                                                <span>
                                                                    {itemData.name}
                                                                    {shareCount > 1 && (
                                                                        <span className="italic ml-1 text-slate-400">(Split with {otherDiners.join(', ')})</span>
                                                                    )}
                                                                </span>
                                                                <span className="font-mono">${pricePerPerson.toFixed(2)}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="border-t pt-3 mt-2">
                                            <label htmlFor={`tip-${person.name}`} className="block text-sm font-medium text-slate-700 mb-1">
                                                Tip ({tipPercentage}%)
                                                <span className="font-mono text-slate-500 ml-2">${person.tip.toFixed(2)}</span>
                                            </label>
                                            <input
                                                id={`tip-${person.name}`}
                                                type="range"
                                                min="0"
                                                max="30"
                                                step="1"
                                                value={tipPercentage}
                                                onChange={(e) => onDinerTipChange(person.name, parseInt(e.target.value, 10))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                disabled={isSettled}
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center font-bold mt-3 pt-2 border-t border-slate-200">
                                          <span className="text-base text-slate-800">Grand Total (with Tip)</span>
                                          <span className="text-base font-mono text-slate-900">${person.total.toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="mt-4 text-right">
                                            <button 
                                                onClick={() => onToggleSettlement(person.name)}
                                                className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${
                                                    isSettled
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            >
                                                {isSettled ? 'Unsettle' : 'Settle'}
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SummaryView;