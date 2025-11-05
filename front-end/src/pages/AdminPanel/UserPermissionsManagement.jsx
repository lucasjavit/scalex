import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../modules/auth-social/context/AuthContext';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import permissionsService from '../../services/permissionsService';
import { getApiUrl } from '../../utils/apiUrl';
import adminApi from '../../modules/admin/services/adminApi';

export default function UserPermissionsManagement() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { isAdmin, loading: adminCheckLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    await loadUserPermissions(selectedUser);
  };

  // Load user permissions
  const loadUserPermissions = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

      const token = await user.getIdToken();

      setSearchedUser(userData);

      // Get user permissions
      const permissions = await permissionsService.getUserPermissions(userData.id, token);
      setUserPermissions(permissions);

    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('Erro ao carregar permissões. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
      setUserPermissions(null);
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
      await loadUserPermissions(userData);

    } catch (err) {
      console.error('Error searching user:', err);
      setError('Erro ao buscar usuário. Verifique o email e tente novamente.');
      setLoading(false);
    }
  };

  const handlePermissionChange = async (permissionKey, value) => {
    if (!searchedUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const token = await user.getIdToken();

      // Update permission
      await permissionsService.updateUserPermissions(
        searchedUser.id,
        { [permissionKey]: value },
        token
      );

      // Update local state
      setUserPermissions((prev) => ({
        ...prev,
        [permissionKey]: value,
      }));

      setSuccessMessage('Permissão atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating permission:', err);
      setError('Erro ao atualizar permissão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!searchedUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const token = await user.getIdToken();

      // Toggle user status
      const response = await fetch(getApiUrl(`/users/${searchedUser.id}/toggle-status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do usuário');
      }

      const updatedUser = await response.json();

      // Update local state
      setSearchedUser(updatedUser);

      const statusText = updatedUser.is_active ? 'ativado' : 'inativado';
      setSuccessMessage(`Usuário ${statusText} com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Erro ao atualizar status do usuário. Tente novamente.');
    } finally {
      setSaving(false);
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

  const openDeleteConfirmation = () => {
    setDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    if (!deleting) {
      setDeleteConfirmation(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!searchedUser) return;

    try {
      setDeleting(true);
      setError(null);
      await adminApi.deleteUser(searchedUser.id);

      // Clear the searched user and show success
      setDeleteConfirmation(false);
      setSuccessMessage('Usuário deletado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Clear search
      setSearchedUser(null);
      setUserPermissions(null);
      setSearchEmail('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Erro ao deletar usuário. Tente novamente.');
      setDeleteConfirmation(false);
    } finally {
      setDeleting(false);
    }
  };

  const roles = [
    { value: 'user', label: 'Usuário', description: 'Usuário regular com acesso aos módulos comprados', color: 'bg-blue-500/20 text-blue-300', borderColor: 'border-blue-500' },
    { value: 'admin', label: 'Administrador', description: 'Administrador da plataforma com acesso total', color: 'bg-purple-500/20 text-purple-300', borderColor: 'border-purple-500' },
    { value: 'partner_english_course', label: 'Parceiro: Curso de Inglês', description: 'Parceiro responsável pelo módulo de Curso de Inglês', color: 'bg-green-500/20 text-green-300', borderColor: 'border-green-500' },
    { value: 'partner_cnpj', label: 'Parceiro: Abertura de CNPJ', description: 'Parceiro responsável pelo módulo de Abertura de CNPJ', color: 'bg-yellow-500/20 text-yellow-300', borderColor: 'border-yellow-500' },
    { value: 'partner_remittance', label: 'Parceiro: Remessas Internacionais', description: 'Parceiro responsável pelo módulo de Remessas', color: 'bg-orange-500/20 text-orange-300', borderColor: 'border-orange-500' },
    { value: 'partner_resume', label: 'Parceiro: Currículo Internacional', description: 'Parceiro responsável pelo módulo de Currículo', color: 'bg-pink-500/20 text-pink-300', borderColor: 'border-pink-500' },
    { value: 'partner_interview', label: 'Parceiro: Simulação de Entrevistas', description: 'Parceiro responsável pelo módulo de Entrevistas', color: 'bg-red-500/20 text-red-300', borderColor: 'border-red-500' },
    { value: 'partner_networking', label: 'Parceiro: Networking/LinkedIn', description: 'Parceiro responsável pelo módulo de Networking', color: 'bg-cyan-500/20 text-cyan-300', borderColor: 'border-cyan-500' },
    { value: 'partner_job_marketplace', label: 'Parceiro: Marketplace de Vagas', description: 'Parceiro responsável pelo módulo de Vagas', color: 'bg-indigo-500/20 text-indigo-300', borderColor: 'border-indigo-500' },
    { value: 'partner_community', label: 'Parceiro: Comunidade Premium', description: 'Parceiro responsável pelo módulo de Comunidade', color: 'bg-teal-500/20 text-teal-300', borderColor: 'border-teal-500' },
  ];

  const modules = [
    { key: 'learningCourse', label: 'Aulas de Inglês', icon: '📖' },
    { key: 'learningConversation', label: 'Conversação', icon: '💬' },
    { key: 'businessAccounting', label: 'Contabilidade', icon: '📊' },
    { key: 'businessCareer', label: 'Consultoria', icon: '💼' },
    { key: 'businessJobs', label: 'Vagas Remotas', icon: '🌍' },
    { key: 'businessInsurance', label: 'Seguros', icon: '🛡️' },
    { key: 'businessBanking', label: 'Banco Digital', icon: '💰' },
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

  const isAdminUser = searchedUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-copilot-bg-primary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-copilot-text-secondary">
            Busque um usuário por email para gerenciar role, permissões e status
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          suggestedUser.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {suggestedUser.role}
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

        {/* User Info and Permissions */}
        {searchedUser && userPermissions && (
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
                <div className="flex items-center gap-3">
                  {/* User Status Toggle */}
                  {!isAdminUser && (
                    <button
                      onClick={handleToggleUserStatus}
                      disabled={saving}
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 ${
                        searchedUser.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={searchedUser.is_active ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      {saving ? 'Atualizando...' : searchedUser.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  )}

                  {/* Role Badge */}
                  <span
                    className={`px-3 py-1 rounded-copilot text-sm font-medium ${
                      roles.find(r => r.value === searchedUser.role)?.color || 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {roles.find(r => r.value === searchedUser.role)?.label || searchedUser.role}
                  </span>

                  {/* Delete Button */}
                  {!isAdminUser && (
                    <button
                      onClick={openDeleteConfirmation}
                      className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-copilot transition-colors duration-200"
                      title="Deletar usuário permanentemente"
                    >
                      <span className="mr-1">🗑️</span>
                      Deletar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Role Management Section */}
            <div className="p-6 border-b border-copilot-border-default">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-copilot-text-primary flex-shrink-0">
                  🔑 Role do Usuário
                </label>
                <div className="relative flex-1">
                  <select
                    value={searchedUser.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-2 border-2 border-copilot-border-default rounded-copilot bg-copilot-bg-primary text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-copilot-accent-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-copilot-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="p-6">
              {isAdminUser ? (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">🔓</span>
                  <p className="text-lg text-copilot-text-primary font-medium mb-2">
                    Administrador com Acesso Total
                  </p>
                  <p className="text-sm text-copilot-text-secondary">
                    Usuários admin têm acesso a todos os módulos automaticamente
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-copilot-text-primary mb-4">
                    Permissões de Módulos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((module) => (
                      <div
                        key={module.key}
                        className="flex items-center justify-between p-4 bg-copilot-bg-tertiary rounded-copilot border border-copilot-border-default hover:border-copilot-border-focus transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{module.icon}</span>
                          <span className="text-sm font-medium text-copilot-text-primary">
                            {module.label}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userPermissions[module.key] || false}
                            onChange={(e) =>
                              handlePermissionChange(module.key, e.target.checked)
                            }
                            disabled={saving}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-copilot-accent-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-copilot-accent-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
              <li>2. Clique em "Buscar" para carregar as informações</li>
              <li>3. Selecione a role desejada (Usuário, Admin ou Parceiro)</li>
              <li>4. Use os toggles para ativar/desativar permissões de módulos</li>
              <li>5. Ative/desative o status do usuário com o botão de status</li>
              <li>6. Todas as mudanças são salvas automaticamente</li>
            </ul>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && searchedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg max-w-md w-full p-6 shadow-copilot-xl">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-copilot-text-primary mb-2">
                    Deletar Usuário Permanentemente
                  </h3>
                  <div className="text-sm text-copilot-text-secondary space-y-2">
                    <p>
                      Tem certeza que deseja deletar este usuário permanentemente?
                    </p>
                    <div className="bg-copilot-bg-tertiary border border-copilot-border-default rounded-copilot p-3">
                      <p className="font-medium text-copilot-text-primary">
                        {searchedUser.full_name}
                      </p>
                      <p className="text-xs text-copilot-text-secondary">
                        {searchedUser.email}
                      </p>
                    </div>
                    <p className="text-red-600 font-semibold">
                      Esta ação irá:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      <li>Deletar o usuário do Firebase Authentication</li>
                      <li>Remover todos os dados do usuário do banco de dados</li>
                      <li>Não pode ser desfeita</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirmation}
                  disabled={deleting}
                  className="px-4 py-2 bg-copilot-bg-tertiary text-copilot-text-primary border border-copilot-border-default rounded-copilot hover:bg-copilot-bg-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-copilot hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deletando...
                    </>
                  ) : (
                    <>
                      <span className="mr-1">🗑️</span>
                      Deletar Permanentemente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
