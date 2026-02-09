import { getAnnouncements } from './api';

// Inside your component
useEffect(() => {
  getAnnouncements().then(res => {
    console.log("Here is the real data from Figma's database:", res.data);
  });
}, []);