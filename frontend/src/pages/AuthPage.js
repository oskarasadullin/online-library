import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/books');
      } else {
        await register(formData);
        setIsLogin(true);
        setFormData({ email: '', password: '', full_name: '' });  // Исправлено!
        setError('Регистрация успешна! Теперь войдите в систему');
      }

    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = 'Произошла ошибка. Попробуйте снова.';

      if (err.response) {
        const { status } = err.response;
        const detail = err.response.data?.detail;

        if (status === 422) {
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            const messages = detail.map(error => {
              const msg = error.msg;
              if (msg.includes("value is not a valid email")) {
                return "Неверный формат email";
              } else if (msg.includes("field required")) {
                return "Поле обязательно для заполнения";
              } else if (msg.includes("Value error")) {
                return msg.replace("Value error, ", "");
              }
              return msg;
            });
            errorMessage = messages.join("\n");
          } else {
            errorMessage = "Ошибка валидации данных";
          }
        } else if (status === 429) {
          errorMessage = detail || "Слишком много попыток. Попробуйте через минуту";
        } else if (status === 400) {
          errorMessage = detail || "Пользователь с таким email уже существует";
        } else if (status === 401) {
          errorMessage = detail || "Неверный email или пароль";
        } else if (status === 403) {
          errorMessage = "Доступ запрещен";
        } else if (status === 500) {
          errorMessage = "Ошибка сервера. Попробуйте позже.";
        } else if (detail) {
          errorMessage = detail;
        }
      } else if (err.message) {
        if (err.message.includes('Network Error')) {
          errorMessage = 'Ошибка сети. Проверьте подключение.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Вход' : 'Регистрация'}</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="full_name">ФИО</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Иванов Иван Иванович"
              />
              <small className="form-hint">
                Введите минимум Фамилию и Имя (например: Иванов Иван)
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@mail.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={isLogin ? "Введите пароль" : "8-20 символов"}
            />
            {!isLogin && (
              <small className="form-hint">
                8-20 символов. Обязательно: заглавная (A-Z), строчная (a-z), цифра, спецсимвол
              </small>
            )}
          </div>

          {error && (
            <div className="error-message" style={{ whiteSpace: 'pre-line' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="auth-switch">
          <button
            className="btn-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', full_name: '' });
            }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь!' : 'Уже есть аккаунт? Войдите!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
