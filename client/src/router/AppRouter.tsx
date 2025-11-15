import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import App from '../App';
import { ProtectedRoute } from './ProtectedRoute';
import { CreateItemPage } from '../pages/CreateItemPage';
import { CreateAuctionPage } from '../pages/CreateAuctionPage';
import { AuctionDetailPage } from '../pages/AuctionDetailPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/items/new',
            element: <CreateItemPage />,
          },
          {
            path: '/auctions/new/:itemId',
            element: <CreateAuctionPage />,
          },
        ],
      },
      {
        path: '/auctions/:id',
        element: <AuctionDetailPage />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};