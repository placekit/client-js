import { createRoot } from 'react-dom/client';
import App from './App';

// load TailwindCSS
import './global.css';

const app = document.getElementById('app');
const root = createRoot(app);
root.render(<App />);
