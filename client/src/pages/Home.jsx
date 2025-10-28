// import { usePosts } from '../hooks/Api';
// import { Link } from 'react-router-dom';

// export default function Home() {
//   const { data: posts, loading, error } = usePosts('/posts');

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//   <div className="max-w-3xl mx-auto mt-8">
//     <h1 className="text-3xl font-bold mb-6 text-center">All Posts</h1>

//     {posts.length === 0 ? (
//       <p className="text-gray-500 text-center">No posts found.</p>
//     ) : (
//       posts.map(post => (
//         <div key={post._id} className="bg-white p-4 mb-4 shadow rounded">
//           <h2 className="text-xl font-semibold text-blue-600">
//             <Link to={`/posts/${post._id}`}>{post.title}</Link>
//           </h2>
//           <p className="text-gray-700 mt-2">{post.excerpt}</p>
//         </div>
//       ))
//     )}
//   </div>
// );
// }
