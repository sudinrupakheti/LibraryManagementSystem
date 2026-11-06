import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:8000';

const linkStyle = {
  padding: '10px 20px',
  backgroundColor: 'black',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
};
const daysUntil = (date) => {
  const due = new Date(date);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

const dueText = (days) => {
  if (days === 0) return 'due today';
  if (days === 1) return 'due in 1 day';
  if (days > 1) return `due in ${days} days`;
  if (days === -1) return 'overdue by 1 day';
  return `overdue by ${-days} days`;
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const [borrows, setBorrows] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API}/borrow/my`)
      .then(({ data }) => setBorrows(data.result ?? []))
      .catch((err) => console.error('Error fetching borrows:', err));
  }, [user]);

  const active = borrows.filter((b) => b.status === 'borrowed');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Library System</h1>

      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        {user ? `Hello, ${user.name}!` : 'Please login to start borrowing books.'}
      </p>

      {user &&
        active.map(({ _id, bookId, dueDate }) => {
          const days = daysUntil(dueDate);
          return (
            <p key={_id} style={{ margin: 4, color: days < 0 ? 'red' : '#555' }}>
              <strong>{bookId?.title || 'A book'}</strong> is {dueText(days)}.
            </p>
          );
        })}

      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Link to="/books" style={linkStyle}>
          Browse Books
        </Link>
        {user && (
          <Link to="/my-borrows" style={linkStyle}>
            My Borrows
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
