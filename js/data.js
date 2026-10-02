/* Simulated platform data (O1: 12 platforms, Followers + Engagement Rate).
   In a real system each record would come from a platform API adapter
   behind a server-side aggregation layer. */
const PLATFORMS = [
  { id: 'youtube',   name: 'YouTube',   color: '#D64533', followers: 482300, er: 4.1 },
  { id: 'tiktok',    name: 'TikTok',    color: '#14213D', colorDark: '#E8EEF7', followers: 735900, er: 7.8 },
  { id: 'linkedin',  name: 'LinkedIn',  color: '#2467A8', colorDark: '#4D9BE0', followers: 96400,  er: 3.2 },
  { id: 'instagram', name: 'Instagram', color: '#B83E8C', followers: 410700, er: 5.6 },
  { id: 'facebook',  name: 'Facebook',  color: '#4B6FD6', followers: 268200, er: 2.4 },
  { id: 'x',         name: 'X',         color: '#5B6472', colorDark: '#A3AEBF', followers: 154800, er: 1.9 },
  { id: 'pinterest', name: 'Pinterest', color: '#C2262E', followers: 87300,  er: 2.8 },
  { id: 'snapchat',  name: 'Snapchat',  color: '#D9B300', followers: 121600, er: 6.3 },
  { id: 'reddit',    name: 'Reddit',    color: '#E8742A', followers: 59100,  er: 8.9 },
  { id: 'twitch',    name: 'Twitch',    color: '#7A4FD0', colorDark: '#A07BF0', followers: 72500,  er: 9.4 },
  { id: 'threads',   name: 'Threads',   color: '#2A9D8F', followers: 138900, er: 4.7 },
  { id: 'telegram',  name: 'Telegram',  color: '#2D9CDB', followers: 44200,  er: 10.2 }
];
