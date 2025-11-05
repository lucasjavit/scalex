import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../modules/auth-social/context/AuthContext';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';

export default function UserRolesManagement() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { isAdmin, loading: adminCheckLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!adminCheckLoading && !isAdmin) {
      navigate('/home');
    }
  }, [isAdmin, adminCheckLoading, navigate]);

  // Fetch user suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchEmail.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(getApiUrl('/users'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const allUsers = await response.json();
          // Filter users by email or name that contains the search term
          const filtered = allUsers.filter(u =>
            u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
            u.full_name.toLowerCase().includes(searchEmail.toLowerCase())
          ).slice(0, 5); // Limit to 5 suggestions

          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchEmail, user]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSuggestions]);

  // Select user from suggestions
  const handleSelectUser = async (selectedUser) => {
    setSearchEmail(selectedUser.email);
    setShowSuggestions(false);
    setSearchedUser(selectedUser);
  };

  // Search user by email (form submit)
  const handleSearchUser = async (e) => {
    e.preventDefault();

    if (!searchEmail.trim()) {
      setError('Digite um email para buscar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      setSearchedUser(null);
      setShowSuggestions(false);

      const token = await user.getIdToken();

      // Find user by email
      const response = await fetch(getApiUrl(`/users/email/${encodeURIComponent(searchEmail)}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Usuário não encontrado com este email');
        } else {
          setError('Erro ao buscar usuário. Tente novamente.');
        }
        return;
      }

      const userData = await response.json();
      setSearchedUser(userData);

    } catch (err) {
      console.error('Error searching user:', err);
      setError('Erro ao buscar usuário. Verifique o email e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!searchedUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const token = await user.getIdToken();

      // Update role
      const response = await fetch(getApiUrl(`/users/admin/${searchedUser.id}/role`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar role do usuário');
      }

      const updatedUser = await response.json();

      // Update local state
      setSearchedUser(updatedUser);

      setSuccessMessage('Role atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Erro ao atualizar role. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const roles = [
    { value: 'user', label: 'Usuário', description: 'Usuário regular com acesso aos módulos comprados', color: 'bg-blue-500/20 text-blue-300' },
    { value: 'admin', label: 'Administrador', description: 'Administrador da plataforma com acesso total', color: 'bg-purple-500/20 text-purple-300' },
    { value: 'partner_english_course', label: 'Parceiro: Curso de Inglês', description: 'Parceiro responsável pelo módulo de Curso de Inglês', color: 'bg-green-500/20 text-green-300' },
    { value: 'partner_cnpj', label: 'Parceiro: Abertura de CNPJ', description: 'Parceiro responsável pelo módulo de Abertura de CNPJ', color: 'bg-yellow-500/20 text-yellow-300' },
    { value: 'partner_remittance', label: 'Parceiro: Remessas Internacionais', description: 'Parceiro responsável pelo módulo de Remessas', color: 'bg-orange-500/20 text-orange-300' },
    { value: 'partner_resume', label: 'Parceiro: Currículo Internacional', description: 'Parceiro responsável pelo módulo de Currículo', color: 'bg-pink-500/20 text-pink-300' },
    { value: 'partner_interview', label: 'Parceiro: Simulação de Entrevistas', description: 'Parceiro responsável pelo módulo de Entrevistas', color: 'bg-red-500/20 text-red-300' },
    { value: 'partner_networking', label: 'Parceiro: Networking/LinkedIn', description: 'Parceiro responsável pelo módulo de Networking', color: 'bg-cyan-500/20 text-cyan-300' },
    { value: 'partner_job_marketplace', label: 'Parceiro: Marketplace de Vagas', description: 'Parceiro responsável pelo módulo de Vagas', color: 'bg-indigo-500/20 text-indigo-300' },
    { value: 'partner_community', label: 'Parceiro: Comunidade Premium', description: 'Parceiro responsável pelo módulo de Comunidade', color: 'bg-teal-500/20 text-teal-300' },
  ];

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center">
        <div className="text-copilot-text-primary text-lg">
          {t('loading', 'Carregando...')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-copilot-bg-primary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            Gerenciamento de Roles
          </h1>
          <p className="text-copilot-text-secondary">
            Busque um usuário por email para gerenciar sua role
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchUser} className="mb-8">
          <div className="bg-copilot-bg-secondary rounded-copilot border border-copilot-border-default p-6">
            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
              Email do Usuário
            </label>
            <div className="relative">
              <div className="flex gap-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Digite o email do usuário..."
                  className="flex-1 input-copilot"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-copilot-primary min-w-[120px]"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-copilot-bg-tertiary border border-copilot-border-default rounded-copilot shadow-copilot-xl z-10 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestedUser) => (
                    <button
                      key={suggestedUser.id}
                      type="button"
                      onClick={() => handleSelectUser(suggestedUser)}
                      className="w-full px-4 py-3 text-left hover:bg-copilot-bg-hover transition-colors border-b border-copilot-border-subtle last:border-b-0 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-copilot-text-primary">
                          {suggestedUser.full_name}
                        </div>
                        <div className="text-xs text-copilot-text-secondary">
                          {suggestedUser.email}
                        </div>
                      </div>
                      <span className={roles.find(r => r.value === suggestedUser.role)?.color || 'bg-gray-500/20 text-gray-300'}>
                        <span className="px-2 py-1 rounded text-xs font-medium">
                          {roles.find(r => r.value === suggestedUser.role)?.label || suggestedUser.role}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-copilot text-green-300">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-copilot text-red-300">
            {error}
          </div>
        )}

        {/* User Info and Role Selection */}
        {searchedUser && (
          <div className="bg-copilot-bg-secondary rounded-copilot border border-copilot-border-default overflow-hidden">
            {/* User Info Header */}
            <div className="bg-copilot-bg-tertiary px-6 py-4 border-b border-copilot-border-default">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-copilot-text-primary">
                    {searchedUser.full_name}
                  </h2>
                  <p className="text-sm text-copilot-text-secondary mt-1">
                    {searchedUser.email}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-copilot text-sm font-medium ${roles.find(r => r.value === searchedUser.role)?.color || 'bg-gray-500/20 text-gray-300'}`}>
                  {roles.find(r => r.value === searchedUser.role)?.label || searchedUser.role}
                </span>
              </div>
            </div>

            {/* Role Selection */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-copilot-text-primary mb-4">
                Selecione a Role do Usuário
              </h3>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleChange(role.value)}
                    disabled={saving || searchedUser.role === role.value}
                    className={`w-full text-left p-4 rounded-copilot border transition-all ${
                      searchedUser.role === role.value
                        ? 'border-copilot-accent-primary bg-copilot-accent-primary/10'
                        : 'border-copilot-border-default bg-copilot-bg-tertiary hover:border-copilot-border-focus'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-3 py-1 rounded-copilot text-sm font-medium ${role.color}`}>
                            {role.label}
                          </span>
                          {searchedUser.role === role.value && (
                            <span className="text-copilot-accent-primary text-sm font-semibold">
                              ✓ Ativa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-copilot-text-secondary mt-2">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!searchedUser && (
          <div className="mt-6 p-6 bg-copilot-bg-secondary rounded-copilot border border-copilot-border-default">
            <h3 className="text-sm font-medium text-copilot-text-primary mb-3">
              ℹ️ Como usar:
            </h3>
            <ul className="text-sm text-copilot-text-secondary space-y-2">
              <li>1. Digite o email completo do usuário no campo acima</li>
              <li>2. Clique em "Buscar" para carregar as informações do usuário</li>
              <li>3. Selecione a role desejada na lista abaixo</li>
              <li>4. A mudança é aplicada imediatamente</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
