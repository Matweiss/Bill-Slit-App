import React from 'react';
import { PersonTotal } from '../types';
import { ShareIcon, DownloadIcon } from './icons';

interface ExportShareButtonsProps {
  totals: PersonTotal[];
}

const ExportShareButtons: React.FC<ExportShareButtonsProps> = ({ totals }) => {
  const hasSupport = typeof navigator !== 'undefined' && 'share' in navigator;

  const generateShareText = () => {
    let text = "Bill Split Summary:\n";
    totals.forEach(p => {
      text += `\n- ${p.name}: $${p.total.toFixed(2)} (Sub: $${p.subtotal.toFixed(2)}, Tax: $${p.tax.toFixed(2)}, Tip: $${p.tip.toFixed(2)})`;
    });
    return text;
  };

  const handleShare = async () => {
    if (hasSupport) {
      try {
        await navigator.share({
          title: 'Bill Split Summary',
          text: generateShareText(),
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Diner,Subtotal,Tax,Tip,Total\n";
    
    totals.forEach(p => {
      const row = [p.name, p.subtotal.toFixed(2), p.tax.toFixed(2), p.tip.toFixed(2), p.total.toFixed(2)].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bill_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (totals.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleExportCSV}
        className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
        aria-label="Export summary to CSV"
      >
        <DownloadIcon className="w-5 h-5" />
      </button>
      {hasSupport && (
        <button 
          onClick={handleShare}
          className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
          aria-label="Share summary"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ExportShareButtons;