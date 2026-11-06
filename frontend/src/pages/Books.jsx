import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:8000';

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

  const handleBorrow = async (bookId) => {
    const dueDate = prompt('Enter due date (YYYY-MM-DD):');
    if (!dueDate) return;
    try {
      await axios.post(`${API}/borrow`, { bookId, dueDate });
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

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {books.map((book) => {
          const available = book.availableCopies ?? book.totalCopies;
          return (
            <li
              key={book._id}
              style={{ padding: '12px 0', borderBottom: '1px solid #ccc' }}
            >
              <strong>{book.title}</strong> by {book.author}
              <div>ISBN: {book.isbn} | Category: {book.category}</div>
              <div>Available: {available} / {book.totalCopies}</div>

              <div style={{ marginTop: 8, display: 'flex', gap: '8px' }}>
                {isAdmin && (
                  <>
                    <button onClick={() => handleEdit(book)}>Edit</button>
                    <button onClick={() => handleDelete(book._id)}>Delete</button>
                  </>
                )}
                {user && available > 0 && (
                  <button onClick={() => handleBorrow(book._id)}>
                    Borrow
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Books;
