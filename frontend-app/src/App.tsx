import React, {} from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom';

/**
 * Redux
 */
import { Provider } from 'react-redux'
import { store } from '@/redux/store'

/**
 * Ant Design
 */
import 'antd/dist/reset.css'

/**
 * Routes
 */
import { routes as AdminRoute } from '@/routes/routes';

const routes = [
  ...AdminRoute,
];
const router = createHashRouter(routes);

function App() {
  return (
    <React.Fragment>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.Fragment>
  )
}

export default App
