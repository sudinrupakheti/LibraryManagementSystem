import { useState, useEffect } from 'react';
import axios from 'axios';

const AllBorrows = () => {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => {
    fetchAllBorrows();
  }, []);

  const fetchAllBorrows = async () => {
    try {
      const response = await axios.get('http://localhost:8000/borrow');
      setBorrows(response.data.result);
    } catch (error) {
      console.error('Error fetching borrows:', error);
      alert('Error fetching borrows. Admin access required.');
    }
  };

  return (
    <div>
      <h1>All Borrow History (Admin Only)</h1>

      {borrows.length === 0 ? (
        <p>No borrows found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Book Title</th>
              <th>Author</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((borrow) => (
              <tr key={borrow._id}>
                <td>{borrow.userID?.name || 'Unknown'}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllBorrows;
