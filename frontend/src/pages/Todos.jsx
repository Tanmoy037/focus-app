import { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo, getGoals } from '../services/api';
import { format } from 'date-fns';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    goal_id: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [todosRes, goalsRes] = await Promise.all([
        getTodos(),
        getGoals()
      ]);
      setTodos(todosRes.data);
      setGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTodo(formData);
      setFormData({ title: '', description: '', priority: 'medium', due_date: '', goal_id: null });
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await updateTodo(todo.id, { is_completed: !todo.is_completed });
      fetchData();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.is_completed;
    if (filter === 'completed') return todo.is_completed;
    return true;
  });

  if (loading) {
    return <div className="container" style={{ paddingTop: '40px' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#f4f4f5', marginBottom: '8px' }}>
            My Todos ✅
          </h1>
          <p style={{ color: '#a1a1aa' }}>
            {todos.filter(t => !t.is_completed).length} active tasks
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + New Todo
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn"
            style={{
              background: filter === f ? '#8b5cf6' : '#27272a',
              color: filter === f ? 'white' : '#a1a1aa',
              textTransform: 'capitalize',
              border: filter === f ? '1px solid #a855f7' : '1px solid #3f3f46'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleComplete}
            onDelete={handleDelete}
            goals={goals}
          />
        ))}

        {filteredTodos.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#f4f4f5' }}>
              {filter === 'completed' ? 'No completed tasks yet' : 'No tasks yet'}
            </h3>
            <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>
              {filter === 'completed' ? 'Complete some tasks to see them here!' : 'Create your first task to get started!'}
            </p>
            {filter !== 'completed' && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                Create Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Todo Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#f4f4f5' }}>Create New Task</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#e4e4e7' }}>Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete project documentation"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#e4e4e7' }}>Description</label>
                <textarea
                  className="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details..."
                  rows="3"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#e4e4e7' }}>Priority</label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#e4e4e7' }}>Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#e4e4e7' }}>Link to Goal (Optional)</label>
                <select
                  className="input"
                  value={formData.goal_id || ''}
                  onChange={(e) => setFormData({ ...formData, goal_id: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">No goal</option>
                  {goals.filter(g => !g.is_achieved).map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Task
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, goals }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  const goalForTodo = goals.find(g => g.id === todo.goal_id);

  return (
    <div className="card" style={{
      padding: '16px',
      opacity: todo.is_completed ? 0.7 : 1,
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={() => onToggle(todo)}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            marginTop: '2px',
            accentColor: '#8b5cf6'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: todo.is_completed ? 'line-through' : 'none',
              color: todo.is_completed ? '#52525b' : '#f4f4f5'
            }}>
              {todo.title}
            </h3>
            <span className="badge" style={{
              background: getPriorityColor(todo.priority) + '20',
              color: getPriorityColor(todo.priority)
            }}>
              {todo.priority}
            </span>
          </div>
          {todo.description && (
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '8px' }}>
              {todo.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#71717a' }}>
            {goalForTodo && <span>🎯 {goalForTodo.title}</span>}
            {todo.due_date && <span>📅 Due: {format(new Date(todo.due_date), 'MMM dd, yyyy')}</span>}
          </div>
        </div>
        <button
          onClick={() => onDelete(todo.id)}
          className="btn btn-danger"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

