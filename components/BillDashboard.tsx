import React, { useState } from 'react';
import { Bill } from '../types';
import NewBillCreator from './NewBillCreator';
import { TrashIcon, BroomIcon, ChevronDownIcon } from './icons';
import { calculateTotalsForBill } from '../utils/calculations';

interface BillDashboardProps {
  bills: Bill[];
  onSelectBill: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  onClearSettledBills: () => void;
  newBillDiners: string[];
  onAddStagedDiner: (name: string) => void;
  onRemoveStagedDiner: (name: string) => void;
  frequentDiners: string[];
}

const BillDashboard: React.FC<BillDashboardProps> = ({ 
    bills, onSelectBill, onDeleteBill, onImageUpload, isLoading, onClearSettledBills,
    newBillDiners, onAddStagedDiner, onRemoveStagedDiner, frequentDiners
}) => {
    
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  const isBillSettled = (bill: Bill) => 
    bill.diners.length > 0 && bill.diners.every(diner => bill.dinerSettlement[diner]);

  const unsettledBills = bills.filter(bill => !isBillSettled(bill))
    .sort((a, b) => b.createdAt - a.createdAt);

  const settledBillsCount = bills.length - unsettledBills.length;

  const handleToggleExpand = (billId: string) => {
    setExpandedBillId(prevId => prevId === billId ? null : billId);
  };


  const BillCard: React.FC<{bill: Bill}> = ({ bill }) => {
    const totals = calculateTotalsForBill(bill);
    const settledTotals = totals.filter(t => bill.dinerSettlement[t.name]);
    const unsettledTotals = totals.filter(t => !bill.dinerSettlement[t.name]);
    const isExpanded = expandedBillId === bill.id;

    return (
        <li className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative group flex flex-col">
            <div className="p-4 flex-grow">
                <button
                    onClick={() => onSelectBill(bill.id)}
                    className="block w-full text-left"
                >
                    <h3 className="font-bold text-slate-800 truncate">{bill.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Created: {new Date(bill.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 text-sm text-slate-600">
                        {bill.diners.length > 0 ? (
                            <p className="truncate">
                                <span className="font-semibold">Diners:</span> {bill.diners.join(', ')}
                            </p>
                        ) : (
                            <p className="italic">No diners yet.</p>
                        )}
                    </div>
                </button>
                <div className="mt-2 flex justify-between items-center">
                     <span className={`text-xs font-medium px-2 py-1 rounded-full ${isBillSettled(bill) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {settledTotals.length} / {totals.length} Settled
                    </span>
                    <span className="text-lg font-mono font-bold text-slate-700">
                        ${bill.parsedReceipt?.total.toFixed(2) ?? '0.00'}
                    </span>
                </div>
            </div>

            {totals.length > 0 && (
                <>
                    <div className={`px-4 pb-4 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="border-t pt-2">
                            {unsettledTotals.length > 0 && (
                                <div className="mb-2">
                                    <h4 className="font-semibold text-sm text-red-600">Unsettled</h4>
                                    <ul className="text-sm text-slate-600">
                                        {unsettledTotals.map(t => (
                                            <li key={t.name} className="flex justify-between">
                                                <span>{t.name}</span>
                                                <span className="font-mono">${t.total.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {settledTotals.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-green-600">Settled</h4>
                                    <ul className="text-sm text-slate-500 line-through">
                                        {settledTotals.map(t => (
                                            <li key={t.name} className="flex justify-between">
                                                <span>{t.name}</span>
                                                <span className="font-mono">${t.total.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggleExpand(bill.id)}
                        className="w-full text-center py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-b-lg border-t"
                        aria-expanded={isExpanded}
                    >
                        <ChevronDownIcon className={`w-5 h-5 mx-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBill(bill.id);
                }}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete bill ${bill.title}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </li>
    );
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <NewBillCreator 
            newBillDiners={newBillDiners}
            onAddDiner={onAddStagedDiner}
            onRemoveDiner={onRemoveStagedDiner}
            frequentDiners={frequentDiners}
            onImageUpload={onImageUpload} 
            isLoading={isLoading}
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Bill History (Unpaid)</h2>
            {settledBillsCount > 0 && (
                <button 
                    onClick={onClearSettledBills}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    aria-label={`Clear ${settledBillsCount} fully settled bills`}
                >
                    <BroomIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Clear </span> {settledBillsCount} Settled Bill{settledBillsCount > 1 ? 's' : ''}
                </button>
            )}
        </div>

        {unsettledBills.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unsettledBills.map(bill => <BillCard key={bill.id} bill={bill} />)}
            </ul>
        ) : (
             <p className="text-center text-slate-500 py-8">
                {bills.length > 0 
                    ? "All bills are settled! You can clear them using the button above."
                    : "You have no saved bills. Upload a receipt to get started!"
                }
            </p>
        )}
      </div>

    </div>
  );
};

export default BillDashboard;