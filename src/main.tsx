import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import eruda from 'eruda';
import { BrowserRouter, HashRouter } from 'react-router-dom';

const manifestUrl = 'https://politmarket-ton.github.io/jsonstorage/tonconnect-manifest.json';
eruda.init()


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <BrowserRouter basename={"/predictions"}>
      <App />
    </BrowserRouter>
  </TonConnectUIProvider>,
)
