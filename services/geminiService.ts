
import { GoogleGenAI, Type } from '@google/genai';
import { ReceiptData, Assignment, ReceiptItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const receiptSchema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            description: 'A list of all items found on the receipt.',
            items: {
                type: Type.OBJECT,
                properties: {
                    id: {
                        type: Type.INTEGER,
                        description: 'A unique integer ID for each item, starting from 1.'
                    },
                    name: {
                        type: Type.STRING,
                        description: 'The name of the item.'
                    },
                    price: {
                        type: Type.NUMBER,
                        description: 'The total price for this line item (quantity * unit price).'
                    },
                    quantity: {
                        type: Type.INTEGER,
                        description: 'The quantity of the item.'
                    }
                },
                required: ['id', 'name', 'price', 'quantity']
            }
        },
        subtotal: {
            type: Type.NUMBER,
            description: 'The subtotal before tax and tip.'
        },
        tax: {
            type: Type.NUMBER,
            description: 'The total tax amount.'
        },
        total: {
            type: Type.NUMBER,
            description: 'The final total on the receipt.'
        },
    },
    required: ['items', 'subtotal', 'tax', 'total']
};


const assignmentSchema = {
    type: Type.OBJECT,
    properties: {
        assignments: {
            type: Type.ARRAY,
            description: 'The updated list of all item assignments.',
            items: {
                type: Type.OBJECT,
                properties: {
                    itemId: {
                        type: Type.INTEGER,
                        description: 'The ID of the item being assigned.'
                    },
                    personNames: {
                        type: Type.ARRAY,
                        description: 'A list of names of the people this item is assigned to.',
                        items: { type: Type.STRING }
                    }
                },
                required: ['itemId', 'personNames']
            }
        }
    },
    required: ['assignments']
};

function cleanJsonString(jsonStr: string): string {
    return jsonStr.replace(/^```json\s*|```\s*$/g, '').trim();
}

export async function parseReceipt(imageBase64: string, mimeType: string): Promise<ReceiptData> {
    const prompt = 'Analyze this receipt image and extract all line items with their quantity and price. Also, extract the subtotal, tax, and the final total. Provide a unique integer ID for each item starting from 1. If a quantity is not specified, assume it is 1. Calculate the line item total if it is not present.';
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: receiptSchema
        }
    });

    const jsonStr = cleanJsonString(response.text);
    const parsedData = JSON.parse(jsonStr) as ReceiptData;

    // Sanitize data
    if (!parsedData.items || !Array.isArray(parsedData.items)) {
        parsedData.items = [];
    }
    
    return {
        ...parsedData,
        items: parsedData.items.map(item => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
        })),
        subtotal: Number(parsedData.subtotal) || 0,
        tax: Number(parsedData.tax) || 0,
        total: Number(parsedData.total) || 0,
    };
}

export async function updateAssignments(message: string, receipt: ReceiptData, currentAssignments: Assignment[]): Promise<Assignment[]> {
    const prompt = `
    You are an intelligent bill-splitting assistant. Your task is to update item assignments based on user commands.
    
    Current Bill Items:
    ${receipt.items.map(item => `- ID ${item.id}: ${item.name} ($${item.price.toFixed(2)})`).join('\n')}

    Current Assignments:
    ${currentAssignments.map(a => `- Item ID ${a.itemId}: ${a.personNames.join(', ') || 'Unassigned'}`).join('\n')}
    
    User Command: "${message}"

    Based on the user command, update the assignments for the relevant items.
    - If a user says "I had...", assign the item to them.
    - If a user says "Alice and Bob shared...", assign the item to both Alice and Bob.
    - A person can be assigned multiple items.
    - An item can be assigned to multiple people.
    - If the user's command is unclear or doesn't seem to relate to assigning items, return the current assignments unchanged.
    - IMPORTANT: Respond with the complete, updated list of ALL assignments, not just the ones that changed.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: assignmentSchema
        }
    });

    const jsonStr = cleanJsonString(response.text);
    const { assignments } = JSON.parse(jsonStr) as { assignments: Assignment[] };

    // Validate that the returned assignments match the structure of the receipt
    if (!assignments || !Array.isArray(assignments) || assignments.length !== receipt.items.length) {
        throw new Error("AI returned invalid assignment structure.");
    }

    return assignments;
}
