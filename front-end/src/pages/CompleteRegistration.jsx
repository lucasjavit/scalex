import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth-social/context/AuthContext';
import apiService from '../services/api';

export default function CompleteRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: user?.displayName || '',
    birth_date: '',
    phone: '',
    preferred_language: 'pt-BR',
    // Address fields
    postal_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare user data
      const userData = {
        firebase_uid: user.uid,
        email: user.email,
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        phone: formData.phone,
        preferred_language: formData.preferred_language,
        addresses: [
          {
            address_type: 'primary',
            street: formData.street,
            number: formData.number,
            complement: formData.complement || null,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            is_primary: true,
          }
        ]
      };

      // Create user in backend
      const newUser = await apiService.createUser(userData);

      // Store userId in localStorage
      if (newUser?.id) {
        localStorage.setItem('userId', newUser.id);
      }

      // Redirect to home after successful registration
      navigate('/home');
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-copilot-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg shadow-copilot-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-4">
              <span className="text-5xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
              Complete seu Cadastro
            </h1>
            <p className="text-copilot-text-secondary">
              Precisamos de algumas informações para finalizar seu cadastro
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-copilot p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-copilot-text-primary border-b border-copilot-border-default pb-2">
                Informações Pessoais
              </h2>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                  placeholder="João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-copilot-border-default rounded-copilot text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Idioma Preferido
                </label>
                <select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-copilot-text-primary border-b border-copilot-border-default pb-2">
                Endereço
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="Rua das Flores"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                  placeholder="Apto 101"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="Centro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="12345-678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                    placeholder="SP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  País *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-copilot-bg-primary border border-copilot-border-default rounded-copilot text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary"
                  placeholder="Brasil"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-copilot-border-default">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-copilot-accent-primary text-white px-6 py-4 rounded-copilot font-semibold hover:bg-copilot-accent-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Criando conta...
                  </span>
                ) : (
                  'Completar Cadastro'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
