import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import MainView from './components/MainView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <MainView />,
      },
    ],
  },
]);
