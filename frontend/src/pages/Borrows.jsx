import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

const fmt = (date) => new Date(date).toLocaleDateString();

const MyBorrows = () => {
  const [borrows, setBorrows] = useState([]);

  const fetchMyBorrows = async () => {
    try {
      const { data } = await axios.get(`${API}/borrow/my`);
      setBorrows(data.result ?? []);
    } catch (err) {
      console.error('Error fetching borrows:', err);
    }
  };

  useEffect(() => {
    fetchMyBorrows();
  }, []);

  const handleReturn = async (id) => {
    if (!window.confirm('Return this book?')) return;
    try {
      await axios.put(`${API}/borrow/${id}/return`);
      alert('Book returned successfully!');
      fetchMyBorrows();
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning book');
    }
  };

  return (
    <div>
      <h1>Borrow History</h1>

      {borrows.length === 0 ? (
        <p>You haven't borrowed any books yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((borrow) => (
              <tr key={borrow._id}>
                <td>{borrow.bookId?.title || 'Unknown'}</td>
                <td>{borrow.bookId?.author || 'Unknown'}</td>
                <td>{fmt(borrow.borrowDate)}</td>
                <td>{fmt(borrow.dueDate)}</td>
                <td>{borrow.returnDate ? fmt(borrow.returnDate) : '-'}</td>
                <td>
                  <span
                    style={{
                      color: borrow.status === 'returned' ? 'green' : 'orange',
                      fontWeight: 'bold',
                    }}
                  >
                    {borrow.status}
                  </span>
                </td>
                <td>
                  {borrow.status === 'borrowed' && (
                    <button onClick={() => handleReturn(borrow._id)}>Return</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBorrows;
