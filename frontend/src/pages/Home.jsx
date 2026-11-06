import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Library System</h1>

      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        {user ? `Hello, ${user.name}!` : 'Please login to start borrowing books.'}
      </p>

      <Link
        to="/books"
        style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'black',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}
      >
        Browse Books
      </Link>
    </div>
  );
};

export default Home;
