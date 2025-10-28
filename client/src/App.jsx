import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostList from './components/postList'; 
import PostDetail from './components/postDetail';
import PostForm from './components/postForm';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PostList />} /> 
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit/:id"
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<h1 className="text-center text-4xl mt-12">404 - Page Not Found</h1>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
