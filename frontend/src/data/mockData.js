// Mock Users
export const mockUsers = [
  { id: 1, name: 'Alex Morgan', role: 'Employee', manager: 'Sarah Chen', email: 'alex.morgan@acme.com', avatar: 'AM' },
  { id: 2, name: 'Jordan Lee', role: 'Employee', manager: 'Sarah Chen', email: 'jordan.lee@acme.com', avatar: 'JL' },
  { id: 3, name: 'Riley Park', role: 'Employee', manager: 'Mike Torres', email: 'riley.park@acme.com', avatar: 'RP' },
  { id: 4, name: 'Sarah Chen', role: 'Manager', manager: '—', email: 'sarah.chen@acme.com', avatar: 'SC' },
  { id: 5, name: 'Mike Torres', role: 'Manager', manager: '—', email: 'mike.torres@acme.com', avatar: 'MT' },
  { id: 6, name: 'Dana Kim', role: 'Admin', manager: '—', email: 'dana.kim@acme.com', avatar: 'DK' },
];

// Mock Expenses
export const mockExpenses = [
  { id: 1, employee: 'Alex Morgan', category: 'Travel', description: 'Flight to NYC client meeting', amount: 480.00, date: '2024-06-01', status: 'Pending', receipt: 'receipt_001.pdf' },
  { id: 2, employee: 'Jordan Lee', category: 'Meals', description: 'Team dinner — Q2 planning', amount: 127.50, date: '2024-06-03', status: 'Approved', receipt: 'receipt_002.pdf' },
  { id: 3, employee: 'Riley Park', category: 'Software', description: 'Figma Pro annual subscription', amount: 144.00, date: '2024-06-05', status: 'Approved', receipt: 'receipt_003.pdf' },
  { id: 4, employee: 'Alex Morgan', category: 'Hotel', description: 'NYC Marriott — 2 nights', amount: 340.00, date: '2024-06-06', status: 'Rejected', receipt: 'receipt_004.pdf' },
  { id: 5, employee: 'Jordan Lee', category: 'Office Supplies', description: 'Monitor stand + keyboard', amount: 89.99, date: '2024-06-08', status: 'Pending', receipt: 'receipt_005.pdf' },
  { id: 6, employee: 'Riley Park', category: 'Training', description: 'React Advanced Conference ticket', amount: 299.00, date: '2024-06-10', status: 'Pending', receipt: 'receipt_006.pdf' },
  { id: 7, employee: 'Alex Morgan', category: 'Meals', description: 'Client lunch — Prospect Corp', amount: 65.00, date: '2024-06-12', status: 'Approved', receipt: 'receipt_007.pdf' },
];

// Mock Approval Rules
export const mockRules = [
  { id: 1, name: 'Standard Approval', approvers: ['Sarah Chen', 'Dana Kim'], sequential: true, percentageRequired: 100 },
  { id: 2, name: 'High Value (>$500)', approvers: ['Mike Torres', 'Sarah Chen', 'Dana Kim'], sequential: true, percentageRequired: 100 },
  { id: 3, name: 'Any Manager Approval', approvers: ['Sarah Chen', 'Mike Torres'], sequential: false, percentageRequired: 50 },
];

export const categories = ['Travel', 'Meals', 'Hotel', 'Software', 'Office Supplies', 'Training', 'Equipment', 'Other'];

export const roles = ['Employee', 'Manager', 'Admin'];

export const managers = ['Sarah Chen', 'Mike Torres'];

// OCR Mock Data
export const ocrMockData = {
  amount: '248.50',
  date: '2024-06-15',
  description: 'Business lunch — Prospect meeting at The Capital Grille',
  category: 'Meals',
};
