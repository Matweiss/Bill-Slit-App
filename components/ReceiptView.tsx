import React, { useState, useRef, useEffect } from 'react';
import { Bill, ReceiptItem } from '../types';
import { ArrowLeftIcon, XIcon, TrashIcon, PencilIcon, CheckIcon } from './icons';
import DinerManager from './DinerManager';
import ChatInput from './ChatInput';

interface ReceiptViewProps {
  bill: Bill;
  onGoToDashboard: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateAssignment: (itemId: number, personNames: string[]) => void;
  onClearAllAssignments: () => void;
  onAddDiner: (name: string) => void;
  onRemoveDiner: (name: string) => void;
  onUpdateReceiptItem: (itemId: number, name: string, price: number) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onSplitEvenly: () => void;
  onAddDinerToAllItems: (name: string) => void;
}

const ReceiptView: React.FC<ReceiptViewProps> = ({ 
    bill, onGoToDashboard, onUpdateTitle, onUpdateAssignment, 
    onClearAllAssignments, onAddDiner, onRemoveDiner, onUpdateReceiptItem,
    onSendMessage, isLoading, onSplitEvenly, onAddDinerToAllItems
}) => {
  const [draggingItemId, setDraggingItemId] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{name: string, price: string}>({ name: '', price: '' });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(bill.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
        titleInputRef.current?.focus();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
        onUpdateTitle(titleValue.trim());
    } else {
        setTitleValue(bill.title); // revert if empty
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleTitleBlur();
    } else if (e.key === 'Escape') {
        setTitleValue(bill.title);
        setIsEditingTitle(false);
    }
  };

  const hasAssignments = bill.assignments.some(a => a.personNames.length > 0);

  const getAssignmentsForItem = (itemId: number): string[] => {
    const assignment = bill.assignments.find(a => a.itemId === itemId);
    return assignment ? assignment.personNames : [];
  };

  const handleClearAssignment = (itemId: number) => {
    onUpdateAssignment(itemId, []);
  };
  
  const handleEditClick = (item: ReceiptItem) => {
    setEditingItemId(item.id);
    setEditFormData({ name: item.name, price: item.price.toFixed(2) });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditFormData({ name: '', price: '' });
  };

  const handleSaveEdit = (itemId: number) => {
    const newPrice = parseFloat(editFormData.price);
    if (editFormData.name.trim() && !isNaN(newPrice)) {
      onUpdateReceiptItem(itemId, editFormData.name.trim(), newPrice);
      handleCancelEdit();
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!bill.parsedReceipt || !bill.receiptImage) {
    return <div>Loading bill...</div>;
  }

  return (
    <>
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" 
          onClick={() => setIsImageModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <img src={bill.receiptImage!} alt="Enlarged Receipt" className="max-h-full max-w-full object-contain" />
          <button 
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
            aria-label="Close image view"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
          <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 group flex-grow">
                {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        className="text-2xl font-bold text-slate-800 bg-slate-100 rounded-md p-1 -m-1"
                    />
                ) : (
                    <h2 
                        className="text-2xl font-bold text-slate-800 cursor-pointer"
                        onClick={() => setIsEditingTitle(true)}
                    >
                        {bill.title}
                    </h2>
                )}
                <PencilIcon 
                    className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                    onClick={() => setIsEditingTitle(true)}
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                  <button 
                      onClick={onClearAllAssignments} 
                      className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                      disabled={!hasAssignments}
                      aria-label="Clear all assignments"
                  >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline sm:ml-2">Clear Assignments</span>
                  </button>
                  <button onClick={onGoToDashboard} className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span className="hidden sm:inline sm:ml-2">Back to Dashboard</span>
                  </button>
              </div>
          </div>
        
          <div className="mb-4">
              <img 
                src={bill.receiptImage} 
                alt="Uploaded Receipt" 
                className="rounded-lg max-h-48 w-full object-contain border cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => setIsImageModalOpen(true)}
              />
          </div>

          <div className="my-4 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-700 mb-2">Smart Split</h3>
            <p className="text-sm text-slate-500 mb-3">Use natural language to assign items. The AI will create diners and update totals automatically.</p>
            <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
          </div>

          <div className="mb-4 border-b border-slate-200 pb-4">
            <DinerManager
              bill={bill}
              onAddDiner={onAddDiner}
              onRemoveDiner={onRemoveDiner}
              onAssignItem={onUpdateAssignment}
              onSplitEvenly={onSplitEvenly}
              onAddDinerToAllItems={onAddDinerToAllItems}
            />
          </div>

          <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              <h3 className="text-lg font-bold text-slate-700 mb-2">Items</h3>
              <ul className="space-y-3">
              {bill.parsedReceipt.items.map(item => {
                  const assignedNames = getAssignmentsForItem(item.id);
                  const isEditing = editingItemId === item.id;
                  
                  return (
                      <li 
                          key={item.id} 
                          className={`flex justify-between items-start p-3 bg-slate-50 rounded-lg transition-all ${isEditing ? 'ring-2 ring-indigo-300' : ''} ${draggingItemId === item.id ? 'opacity-50' : 'opacity-100'}`}
                          draggable={!isEditing && bill.diners.length > 0}
                          onDragStart={(e) => {
                              if (isEditing) return;
                              e.dataTransfer.setData('text/plain', item.id.toString());
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggingItemId(item.id);
                          }}
                          onDragEnd={() => setDraggingItemId(null)}
                      >
                          {isEditing ? (
                              <div className="flex-grow">
                                  <input
                                      type="text"
                                      name="name"
                                      value={editFormData.name}
                                      onChange={handleEditFormChange}
                                      className="w-full p-1 border rounded-md text-sm mb-1"
                                      aria-label="Edit item name"
                                  />
                                  <input
                                      type="number"
                                      name="price"
                                      value={editFormData.price}
                                      onChange={handleEditFormChange}
                                      className="w-24 p-1 border rounded-md text-sm"
                                      aria-label="Edit item price"
                                  />
                              </div>
                          ) : (
                              <div className="flex-grow cursor-grab active:cursor-grabbing">
                                  <p className="font-semibold text-slate-800">{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                                  
                                  <div className="flex items-center gap-2 mt-1">
                                      {bill.diners.length > 0 ? (
                                          <select
                                              multiple
                                              value={assignedNames}
                                              onChange={(e) => {
                                                  const selectedNames = Array.from(e.target.selectedOptions).map(option => (option as HTMLOptionElement).value);
                                                  onUpdateAssignment(item.id, selectedNames);
                                              }}
                                              className={`text-sm text-indigo-600 font-medium bg-slate-100 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 max-h-24 transition-colors ${assignedNames.length > 0 ? 'border-indigo-300' : 'border-slate-200'}`}
                                              aria-label={`Assign ${item.name}`}
                                          >
                                              {bill.diners.map(diner => <option key={diner} value={diner}>{diner}</option>)}
                                          </select>
                                      ) : (
                                          <p className="text-sm text-slate-500">{assignedNames.join(', ') || 'Unassigned'}</p>
                                      )}
                                      {assignedNames.length > 0 && (
                                          <button 
                                              onClick={() => handleClearAssignment(item.id)}
                                              className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"
                                              aria-label={`Clear assignment for ${item.name}`}
                                          >
                                              <XIcon className="w-4 h-4" />
                                          </button>
                                      )}
                                  </div>

                              </div>
                          )}
                          <div className="flex flex-col items-end pl-2">
                            <p className="font-mono text-slate-700">${item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {isEditing ? (
                                    <>
                                        <button onClick={() => handleSaveEdit(item.id)} className="text-green-500 hover:text-green-700" aria-label="Save changes"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700" aria-label="Cancel edit"><XIcon className="w-5 h-5"/></button>
                                    </>
                                ) : (
                                    <button onClick={() => handleEditClick(item)} className="text-slate-400 hover:text-indigo-600" aria-label={`Edit ${item.name}`}><PencilIcon className="w-4 h-4"/></button>
                                )}
                            </div>
                          </div>
                      </li>
                  );
              })}
              </ul>
          </div>
          
          <div className="mt-6 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between font-medium">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-mono text-slate-800">${bill.parsedReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
              <span className="text-slate-600">Tax</span>
              <span className="font-mono text-slate-800">${bill.parsedReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
              <span className="text-slate-800">Total</span>
              <span className="font-mono text-slate-900">${bill.parsedReceipt.total.toFixed(2)}</span>
              </div>
          </div>
      </div>
    </>
  );
};

export default ReceiptView;