// Mock data for session types
export const mockSessionTypes = [
  {
    id: 'session-1',
    builderId: 'builder-1',
    name: 'Initial Consultation',
    description: 'Discuss your project requirements and explore possible solutions.',
    duration: 30, // minutes
    price: 0, // free
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    }
  },
  {
    id: 'session-2',
    builderId: 'builder-1',
    name: 'Technical Deep Dive',
    description: 'Detailed technical discussion about specific aspects of your project.',
    duration: 60, // minutes
    price: 75, // $75
    availability: {
      monday: [{ start: '09:00', end: '15:00' }],
      tuesday: [{ start: '09:00', end: '15:00' }],
      wednesday: [],
      thursday: [{ start: '09:00', end: '15:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
      saturday: [],
      sunday: []
    }
  },
  {
    id: 'session-3',
    builderId: 'builder-2',
    name: 'UX Review',
    description: 'Review your existing interface and provide actionable feedback.',
    duration: 45, // minutes
    price: 85, // $85
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    }
  },
  {
    id: 'session-4',
    builderId: 'builder-3',
    name: 'Architecture Planning',
    description: 'Design and plan the architecture for your application.',
    duration: 90, // minutes
    price: 150, // $150
    availability: {
      monday: [{ start: '09:00', end: '16:00' }],
      tuesday: [{ start: '09:00', end: '16:00' }],
      wednesday: [],
      thursday: [],
      friday: [{ start: '09:00', end: '16:00' }],
      saturday: [],
      sunday: []
    }
  }
];