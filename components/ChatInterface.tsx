import React, { useEffect, useRef } from 'react';
import { Bill } from '../types';
import SummaryView from './SummaryView';
import ExportShareButtons from './ExportShareButtons';
import { calculateTotalsForBill } from '../utils/calculations';

interface ChatInterfaceProps {
  bill: Bill;
  onDinerTipChange: (name: string, percentage: number) => void;
  isLoading: boolean;
  onToggleSettleStatus: (name: string) => void;
  onToggleGratuityIncluded: () => void;
  onApplyTipToAll: (percentage: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    bill, onDinerTipChange, isLoading, onToggleSettleStatus,
    onToggleGratuityIncluded, onApplyTipToAll
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const totals = calculateTotalsForBill(bill);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bill.chatHistory]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Live Summary</h2>
        <ExportShareButtons totals={totals} />
      </div>
      
      <div className="flex-grow bg-slate-50 rounded-lg p-4 my-4 overflow-y-auto h-64">
        <div className="space-y-4">
          {bill.chatHistory.map(chat => (
            <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${chat.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {chat.text}
              </div>
            </div>
          ))}
          {isLoading && bill.chatHistory[bill.chatHistory.length - 1]?.sender === 'user' && (
            <div className="flex justify-start">
              <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <SummaryView
        totals={totals}
        dinerTips={bill.dinerTips}
        onDinerTipChange={onDinerTipChange}
        receipt={bill.parsedReceipt!}
        assignments={bill.assignments}
        settlementStatus={bill.dinerSettlement}
        onToggleSettlement={onToggleSettleStatus}
        gratuityIncluded={bill.gratuityIncluded || false}
        onToggleGratuityIncluded={onToggleGratuityIncluded}
        onApplyTipToAll={onApplyTipToAll}
      />
    </div>
  );
};

export default ChatInterface;