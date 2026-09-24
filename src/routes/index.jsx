import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Template from '../layouts/template.jsx';
import LoginPage from '../pages/middleware/LoginPage.jsx';
import PrivatePage from '../pages/middleware/PrivatePage.jsx';
import Login from '../pages/login.jsx';
import Dashboard from '../pages/dashboard.jsx';
import Book from '../pages/books/Book.jsx';
import Member from '../pages/members/Member.jsx';
import Lending from '../pages/lendings/Lending.jsx';
import Data from '../pages/lendings/Data';
import Denda from '../pages/dendas/Denda.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    children: [
      { path: '', element: <Login /> },
      { path: 'login', element: <Login /> },
    ],
  },
  {
    path: '/dashboard',
    element: <Template />,
    children: [
      {
        path: '',
        element: <PrivatePage />,
        children: [
          { path: '', element: <Dashboard /> },
          { path: 'books', element: <Book /> },
          { path: 'members', element: <Member /> },
          { path: 'lendings', element: <Lending /> },
          { path: 'lendings/data', element: <Data /> },
          { path: 'dendas', element: <Denda /> }
        ],
      },
    ],
  },
]);
