import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:8000';
const LOAN_DAYS = 14;

// Local-timezone-safe YYYY-MM-DD (plain toISOString() can be off by one day)
const toISODate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const FIELDS = [
  { name: 'title', placeholder: 'Title' },
  { name: 'author', placeholder: 'Author' },
  { name: 'isbn', placeholder: 'ISBN' },
  { name: 'totalCopies', placeholder: 'Total Copies', type: 'number' },
];

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography'];

const EMPTY_FORM = { title: '', author: '', isbn: '', category: '', totalCopies: '' };

const Books = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get(`${API}/book`);
      setBooks(data.result);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, totalCopies: Number(form.totalCopies) };
    try {
      if (editingId) {
        await axios.put(`${API}/book/${editingId}`, payload);
      } else {
        await axios.post(`${API}/book`, payload);
      }
      await fetchBooks();
      closeForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving book');
    }
  };

  const handleEdit = (book) => {
    const { title, author, isbn, category, totalCopies } = book;
    setForm({ title, author, isbn, category, totalCopies });
    setEditingId(book._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await axios.delete(`${API}/book/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting book');
    }
  };

  const handleBorrow = async (book) => {
    const dueDate = toISODate(new Date(Date.now() + LOAN_DAYS * 24 * 60 * 60 * 1000));
    if (!window.confirm(`Borrow "${book.title}"?\nDue back: ${dueDate}`)) return;
    try {
      await axios.post(`${API}/borrow`, { bookId: book._id, dueDate });
      alert('Book borrowed successfully!');
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error borrowing book');
    }
  };

  return (
    <div>
      <h1>Books</h1>

      {isAdmin && (
        <button
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
          style={{ marginBottom: 20 }}
        >
          {showForm ? 'Cancel' : 'Add New Book'}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 30, padding: 20, border: '1px solid #ccc' }}>
          <h2>{editingId ? 'Edit Book' : 'Add New Book'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
            {FIELDS.map((f) => (
              <input
                key={f.name}
                {...f}
                value={form[f.name]}
                onChange={handleChange}
                required
              />
            ))}
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      {books.length === 0 ? (
        <p>No books in the library yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const available = book.availableCopies ?? book.totalCopies;
              return (
                <tr key={book._id}>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category}</td>
                  <td>{available} / {book.totalCopies}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isAdmin && (
                        <>
                          <button onClick={() => handleEdit(book)}>Edit</button>
                          <button onClick={() => handleDelete(book._id)}>Delete</button>
                        </>
                      )}
                      {user && available > 0 && (
                        <button onClick={() => handleBorrow(book)}>Borrow</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Books;
