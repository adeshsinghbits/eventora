/**
 * Mock data for demonstration purposes
 * In production, these should come from API calls
 */

export const MOCK_EVENTS = {
  CREATED: [
    {
      _id: '1',
      title: 'React Workshop',
      description: 'Learn advanced React patterns and best practices. This workshop covers hooks, context API, and performance optimization.',
      date: new Date().toISOString(),
      attendees: 45,
    },
    {
      _id: '2',
      title: 'Web Dev Meetup',
      description: 'Monthly meetup for web developers in the city. Network and share knowledge with fellow developers.',
      date: new Date().toISOString(),
      attendees: 32,
    },
  ],
  ATTENDING: [
    {
      _id: '3',
      title: 'JavaScript Conference 2024',
      description: 'Annual conference for JavaScript developers. Featuring talks from industry leaders and networking opportunities.',
      date: new Date().toISOString(),
      attendees: 500,
    },
  ],
  SAVED: [
    {
      _id: '4',
      title: 'UI/UX Design Summit',
      description: 'Learn from top design professionals about the latest trends in design. Interactive workshops and case studies.',
      date: new Date().toISOString(),
      attendees: 250,
    },
  ],
};

export default MOCK_EVENTS;