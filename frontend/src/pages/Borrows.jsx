import { useState, useEffect } from 'react';
import axios from 'axios';

const MyBorrows = () => {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => {
    fetchMyBorrows();
  }, []);

  const fetchMyBorrows = async () => {
    try {
      const response = await axios.get('http://localhost:8000/borrow/my');
      setBorrows(response.data.result);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    }
  };

  const handleReturn = async (borrowId) => {
    if (window.confirm('Return this book?')) {
      try {
        await axios.put(`http://localhost:8000/borrow/${borrowId}/return`);
        fetchMyBorrows();
        alert('Book returned successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error returning book');
      }
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
                <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                <td>
                  {borrow.returnDate
                    ? new Date(borrow.returnDate).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  <span style={{
                    color: borrow.status === 'returned' ? 'green' : 'orange',
                    fontWeight: 'bold'
                  }}>
                    {borrow.status}
                  </span>
                </td>
                <td>
                  {borrow.status === 'borrowed' && (
                    <button onClick={() => handleReturn(borrow._id)}>
                      Return
                    </button>
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
