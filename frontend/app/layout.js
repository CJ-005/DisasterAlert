import './globals.css';
import { RegisterSW } from './RegisterSW';

export const metadata = {
  title: 'Disaster Alert',
  description: 'Disaster preparedness training and alerts',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
