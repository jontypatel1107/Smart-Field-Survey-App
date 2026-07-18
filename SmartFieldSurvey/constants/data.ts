export interface Survey {
  id: string;
  siteName: string;
  clientName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  photo?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  contact?: string;
  notes?: string;
}

export const mockSurveys: Survey[] = [
  {
    id: 'SRV-001',
    siteName: 'Downtown Office Complex',
    clientName: 'ABC Corporation',
    description: 'Annual structural inspection for the main office building.',
    priority: 'High',
    date: '2026-07-18',
    status: 'In Progress',
  },
  {
    id: 'SRV-002',
    siteName: 'Riverside Residential',
    clientName: 'Green Homes LLC',
    description: 'Pre-purchase property survey and condition assessment.',
    priority: 'Medium',
    date: '2026-07-17',
    status: 'Completed',
  },
  {
    id: 'SRV-003',
    siteName: 'Industrial Park Warehouse',
    clientName: 'Swift Logistics',
    description: 'Safety compliance inspection for warehouse facility.',
    priority: 'High',
    date: '2026-07-16',
    status: 'Completed',
  },
  {
    id: 'SRV-004',
    siteName: 'City Mall Renovation',
    clientName: 'Metro Builders',
    description: 'Progress check on ongoing renovation work.',
    priority: 'Low',
    date: '2026-07-15',
    status: 'Pending',
  },
  {
    id: 'SRV-005',
    siteName: 'School Building Extension',
    clientName: 'National Education Board',
    description: 'Inspection of newly constructed classroom wing.',
    priority: 'Medium',
    date: '2026-07-14',
    status: 'Completed',
  },
];

export const studentInfo = {
  name: 'Jonty Patel',
  id: 'STU-2026-042',
  course: 'B.Tech Computer Engineering',
  semester: '6th Semester',
  university: 'GTU',
};
