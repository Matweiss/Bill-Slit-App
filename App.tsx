import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Bill } from './types';
import { parseReceipt, updateAssignments } from './services/geminiService';
import ReceiptView from './components/ReceiptView';
import ChatInterface from './components/ChatInterface';
import BillDashboard from './components/BillDashboard';

const App: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [newBillDiners, setNewBillDiners] = useState<string[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedBillsRaw = localStorage.getItem('bills');
      if (storedBillsRaw) {
        setBills(JSON.parse(storedBillsRaw));
      }
    } catch (e) {
      console.error("Failed to parse bills from localStorage", e);
      localStorage.removeItem('bills');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);
  
  const frequentDiners = useMemo(() => {
    // FIX: Add explicit types to the reduce callback parameters to resolve potential type inference issues.
    const dinerCounts = bills.flatMap(b => b.diners).reduce((acc: Record<string, number>, diner: string) => {
        acc[diner] = (acc[diner] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(dinerCounts)
        // FIX: Add explicit types for sort callback parameters to resolve arithmetic operation error.
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .map(([diner]) => diner)
        .slice(0, 10);
  }, [bills]);

  const updateActiveBill = (updater: (bill: Bill) => Bill) => {
    setBills(prevBills => 
      prevBills.map(bill => 
        bill.id === activeBillId ? updater(bill) : bill
      )
    );
  };

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    
    const newBillId = Date.now().toString();
    const dinerTips = {};
    const dinerSettlement = {};
    newBillDiners.forEach(diner => {
        dinerTips[diner] = 18;
        dinerSettlement[diner] = false;
    });

    const newBill: Bill = {
        id: newBillId,
        title: `New Bill - ${new Date().toLocaleDateString()}`,
        createdAt: Date.now(),
        receiptImage: null,
        parsedReceipt: null,
        assignments: [],
        chatHistory: [],
        diners: [...newBillDiners],
        dinerTips,
        dinerSettlement,
        gratuityIncluded: false,
    };

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Image = (reader.result as string).split(',')[1];
        newBill.receiptImage = `data:${file.type};base64,${base64Image}`;
        
        const receiptData = await parseReceipt(base64Image, file.type);
        newBill.parsedReceipt = receiptData;
        newBill.assignments = receiptData.items.map(item => ({ itemId: item.id, personNames: [] }));
        newBill.chatHistory = [{
            id: 1,
            sender: 'ai',
            text: `Ok, I've scanned the receipt. You can assign items to the diners you've added or use the chat!`
        }];
        
        setBills(prev => [...prev, newBill]);
        setActiveBillId(newBillId);
        setNewBillDiners([]); // Clear the staged diners

      } catch (e) {
        console.error(e);
        setError("Sorry, I couldn't read the receipt. Please try another image.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
      setIsLoading(false);
    };
  }, [newBillDiners]);

  const handleSendMessage = useCallback(async (message: string) => {
    const activeBill = bills.find(b => b.id === activeBillId);
    if (!activeBill?.parsedReceipt || !activeBill?.assignments) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { id: Date.now(), sender: 'user' as const, text: message };
    updateActiveBill(bill => ({...bill, chatHistory: [...bill.chatHistory, userMessage] }));

    try {
        const newAssignments = await updateAssignments(message, activeBill.parsedReceipt, activeBill.assignments);
        
        updateActiveBill(bill => {
            const newDiners = new Set(bill.diners);
            newAssignments.forEach(a => a.personNames.forEach(p => newDiners.add(p)));
            const updatedDiners = Array.from(newDiners);
            
            const newTips = { ...bill.dinerTips };
            const newSettlement = { ...bill.dinerSettlement };
            updatedDiners.forEach(diner => {
                if (typeof diner === 'string') {
                  if (!(diner in newTips)) newTips[diner] = 18;
                  if (!(diner in newSettlement)) newSettlement[diner] = false;
                }
            });
            
            const aiMessage = { id: Date.now() + 1, sender: 'ai' as const, text: "Got it. Who's next?" };

            return {
                ...bill,
                diners: updatedDiners,
                assignments: newAssignments,
                dinerTips: newTips,
                dinerSettlement: newSettlement,
                chatHistory: [...bill.chatHistory, userMessage, aiMessage],
            };
        });

    } catch(e) {
        console.error(e);
        setError("I had trouble understanding that. Could you please rephrase?");
        const aiErrorMessage = { id: Date.now() + 1, sender: 'ai' as const, text: "Sorry, I didn't get that. Can you try again?" };
        updateActiveBill(bill => ({ ...bill, chatHistory: [...bill.chatHistory, userMessage, aiErrorMessage] }));
    } finally {
        setIsLoading(false);
    }
  }, [bills, activeBillId]);

  const handleGoToDashboard = () => setActiveBillId(null);
  
  const handleDeleteBill = (billId: string) => {
    if (confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
        setBills(prev => prev.filter(b => b.id !== billId));
        if (activeBillId === billId) {
            setActiveBillId(null);
        }
    }
  };

  const handleClearSettledBills = () => {
    if (confirm('Are you sure you want to clear all fully settled bills? This will permanently delete them.')) {
        setBills(prevBills => prevBills.filter(bill => {
            if (bill.diners.length === 0) return true; // Keep bills without diners
            return !bill.diners.every(diner => bill.dinerSettlement[diner]);
        }));
    }
  };
  
  const handleUpdateBillTitle = (title: string) => updateActiveBill(bill => ({ ...bill, title }));
  
  const handleAddDiner = (name: string) => updateActiveBill(bill => {
    if (name && !bill.diners.includes(name)) {
      return {
        ...bill,
        diners: [...bill.diners, name],
        dinerTips: { ...bill.dinerTips, [name]: 18 },
        dinerSettlement: { ...bill.dinerSettlement, [name]: false },
      };
    }
    return bill;
  });

  const handleRemoveDiner = (name: string) => updateActiveBill(bill => {
      const newTips = { ...bill.dinerTips };
      delete newTips[name];
      const newSettlement = { ...bill.dinerSettlement };
      delete newSettlement[name];
      return {
          ...bill,
          diners: bill.diners.filter(d => d !== name),
          assignments: bill.assignments.map(a => ({
              ...a,
              personNames: a.personNames.filter(p => p !== name)
          })),
          dinerTips: newTips,
          dinerSettlement: newSettlement,
      }
  });

  const handleUpdateAssignment = (itemId: number, personNames: string[]) => updateActiveBill(bill => ({
      ...bill,
      assignments: bill.assignments.map(a => a.itemId === itemId ? { ...a, personNames } : a)
  }));
  
  const handleClearAllAssignments = () => updateActiveBill(bill => ({
    ...bill,
    assignments: bill.assignments.map(a => ({ ...a, personNames: [] })),
    dinerSettlement: Object.keys(bill.dinerSettlement).reduce((acc, diner) => ({...acc, [diner]: false }), {}),
  }));

  const handleSplitEvenly = () => updateActiveBill(bill => {
    const allDiners = bill.diners;
    if (allDiners.length === 0) return bill;
    return {
      ...bill,
      assignments: bill.assignments.map(a => ({ ...a, personNames: [...allDiners] })),
    };
  });
  
  const handleAddDinerToAllItems = (name: string) => updateActiveBill(bill => ({
    ...bill,
    assignments: bill.assignments.map(a => {
        const newNames = new Set([...a.personNames, name]);
        return { ...a, personNames: Array.from(newNames) };
    })
  }));


  const handleDinerTipChange = (name: string, percentage: number) => updateActiveBill(bill => ({
    ...bill, dinerTips: { ...bill.dinerTips, [name]: percentage }
  }));

  const handleUpdateReceiptItem = (itemId: number, newName: string, newPrice: number) => updateActiveBill(bill => {
      if (!bill.parsedReceipt) return bill;
      const updatedItems = bill.parsedReceipt.items.map(item =>
          item.id === itemId ? { ...item, name: newName, price: newPrice } : item
      );
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
      const taxRate = bill.parsedReceipt.subtotal > 0 ? bill.parsedReceipt.tax / bill.parsedReceipt.subtotal : 0;
      const newTax = newSubtotal * taxRate;
      const newTotal = newSubtotal + newTax;
      return {
        ...bill,
        parsedReceipt: { ...bill.parsedReceipt, items: updatedItems, subtotal: newSubtotal, tax: newTax, total: newTotal }
      };
  });

  const handleToggleSettleStatus = (name: string) => updateActiveBill(bill => ({
    ...bill, dinerSettlement: { ...bill.dinerSettlement, [name]: !bill.dinerSettlement[name] }
  }));

  const handleToggleGratuityIncluded = () => updateActiveBill(bill => ({
    ...bill, gratuityIncluded: !bill.gratuityIncluded
  }));

  const handleApplyTipToAll = (percentage: number) => updateActiveBill(bill => {
    const updatedTips = { ...bill.dinerTips };
    bill.diners.forEach(diner => {
      updatedTips[diner] = percentage;
    });
    return { ...bill, dinerTips: updatedTips };
  });

  const handleAddStagedDiner = (name: string) => {
    if (name && !newBillDiners.includes(name)) {
        setNewBillDiners(prev => [...prev, name]);
    }
  };

  const handleRemoveStagedDiner = (name: string) => {
    setNewBillDiners(prev => prev.filter(d => d !== name));
  };

  const activeBill = bills.find(b => b.id === activeBillId);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight">
            AI Bill Splitter
          </h1>
          <p className="mt-2 text-md sm:text-lg text-slate-600">
            Manage multiple bills, chat to split, and settle up in seconds.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error message">&times;</button>
          </div>
        )}

        {!activeBill ? (
          <BillDashboard 
            bills={bills}
            onSelectBill={setActiveBillId}
            onDeleteBill={handleDeleteBill}
            onImageUpload={handleImageUpload}
            isLoading={isLoading}
            onClearSettledBills={handleClearSettledBills}
            newBillDiners={newBillDiners}
            onAddStagedDiner={handleAddStagedDiner}
            onRemoveStagedDiner={handleRemoveStagedDiner}
            frequentDiners={frequentDiners}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8 w-full">
            <div className="lg:col-span-3">
              <ReceiptView 
                bill={activeBill}
                onGoToDashboard={handleGoToDashboard}
                onUpdateTitle={handleUpdateBillTitle}
                onUpdateAssignment={handleUpdateAssignment}
                onClearAllAssignments={handleClearAllAssignments}
                onAddDiner={handleAddDiner}
                onRemoveDiner={handleRemoveDiner}
                onUpdateReceiptItem={handleUpdateReceiptItem}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onSplitEvenly={handleSplitEvenly}
                onAddDinerToAllItems={handleAddDinerToAllItems}
              />
            </div>
            <div className="lg:col-span-2">
              <ChatInterface
                bill={activeBill}
                onDinerTipChange={handleDinerTipChange}
                isLoading={isLoading}
                onToggleSettleStatus={handleToggleSettleStatus}
                onToggleGratuityIncluded={handleToggleGratuityIncluded}
                onApplyTipToAll={handleApplyTipToAll}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;