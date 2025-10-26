import { Bill, PersonTotal } from '../types';

export const calculateTotalsForBill = (bill: Bill): PersonTotal[] => {
    if (!bill.parsedReceipt) return [];

    const { parsedReceipt, assignments, diners, dinerTips } = bill;

    const personTotals: { [key: string]: { subtotal: number } } = {};
    const allPeople = new Set<string>(diners);

    assignments.forEach(assignment => {
        assignment.personNames.forEach(name => allPeople.add(name));
    });

    Array.from(allPeople).forEach(name => {
        personTotals[name] = { subtotal: 0 };
    });

    assignments.forEach(assignment => {
        const item = parsedReceipt.items.find(i => i.id === assignment.itemId);
        if (item && assignment.personNames.length > 0) {
            const costPerPerson = item.price / assignment.personNames.length;
            assignment.personNames.forEach(name => {
                if (!personTotals[name]) personTotals[name] = { subtotal: 0 };
                personTotals[name].subtotal += costPerPerson;
            });
        }
    });

    return Object.entries(personTotals).map(([name, totals]) => {
        const proportion = parsedReceipt.subtotal > 0 ? totals.subtotal / parsedReceipt.subtotal : 0;
        const tax = proportion * parsedReceipt.tax;
        const tipPercentageForDiner = dinerTips[name] ?? 18;
        const tip = totals.subtotal * (tipPercentageForDiner / 100);

        return {
            name,
            subtotal: totals.subtotal,
            tax,
            tip,
            total: totals.subtotal + tax + tip,
        }
    }).sort((a, b) => b.total - a.total);
};
