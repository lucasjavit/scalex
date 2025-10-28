import { useState, useEffect } from 'react';
import {
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  AVAILABLE_ROLES,
  getRoleInfo
} from '../../services/adminService';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (filterRole === 'all') {
        data = await getAllUsers();
      } else {
        data = await getUsersByRole(filterRole);
      }

      setUsers(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('');
    setSuccessMessage('');
  };

  const handleSaveRole = async () => {
    if (!editingUser || !selectedRole) return;

    try {
      setLoading(true);
      setError(null);

      await updateUserRole(editingUser.id, selectedRole);

      setSuccessMessage(`✓ Role atualizada com sucesso para ${editingUser.full_name}!`);
      setEditingUser(null);
      setSelectedRole('');

      // Recarregar lista
      await loadUsers();

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar role');
      console.error('Error updating role:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-800';
    if (role === 'user') return 'bg-gray-100 text-gray-800';
    if (role.startsWith('partner_')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie roles e permissões dos usuários da plataforma
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Role
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os usuários</option>
            {AVAILABLE_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading && !users.length ? (
            <div className="p-12 text-center text-gray-500">
              Carregando usuários...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser?.id === user.id ? (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-1 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            {AVAILABLE_ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {getRoleInfo(user.role)?.label || user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingUser?.id === user.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleSaveRole}
                              disabled={loading || selectedRole === user.role}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={loading}
                              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditRole(user)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Editar Role
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">
            Total de usuários: <strong className="text-gray-900">{users.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
