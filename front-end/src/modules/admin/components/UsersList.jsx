import { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import AdminLayout from './AdminLayout';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await adminApi.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await adminApi.toggleUserStatus(userId);
      // Reload users to get updated data
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Erro ao alterar status do usuário');
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-copilot p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadUsers}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-copilot text-sm font-medium hover:bg-red-200 transition-colors duration-200"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-copilot-text-primary">Usuários</h2>
              <p className="text-copilot-text-secondary mt-1">
                Gerencie todos os usuários cadastrados no sistema
              </p>
            </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-copilot-text-secondary">
              {filteredUsers.length} de {users.length} usuários
            </span>
            <button
              onClick={loadUsers}
              className="btn-copilot-secondary text-sm"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-copilot-text-primary mb-2">
                Buscar usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Digite email, nome ou telefone..."
                  className="w-full pl-10 pr-4 py-2 border border-copilot-border-default rounded-copilot bg-copilot-bg-primary text-copilot-text-primary placeholder-copilot-text-secondary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-copilot-text-secondary">🔍</span>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-copilot-text-primary mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot bg-copilot-bg-primary text-copilot-text-primary focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                <option value="active">Apenas ativos</option>
                <option value="inactive">Apenas inativos</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-copilot-text-secondary bg-copilot-bg-tertiary border border-copilot-border-default rounded-copilot hover:bg-copilot-bg-primary transition-colors duration-200"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-copilot-border-default">
              <thead className="bg-copilot-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-copilot-text-secondary uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-copilot-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-copilot-text-secondary uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-copilot-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-copilot-bg-secondary divide-y divide-copilot-border-default">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-copilot-bg-tertiary transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-copilot-gradient flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-copilot-text-primary">
                            {user.full_name || 'Nome não informado'}
                          </div>
                          <div className="text-sm text-copilot-text-secondary">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-copilot-text-primary">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-copilot-text-primary">
                        {user.phone || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 cursor-pointer ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={user.is_active ? 'Clique para inativar' : 'Clique para ativar'}
                      >
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-copilot-bg-tertiary px-4 py-3 flex items-center justify-between border-t border-copilot-border-default sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-copilot-border-default text-sm font-medium rounded-copilot text-copilot-text-secondary bg-copilot-bg-secondary hover:bg-copilot-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-copilot-border-default text-sm font-medium rounded-copilot text-copilot-text-secondary bg-copilot-bg-secondary hover:bg-copilot-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-copilot-text-secondary">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> até{' '}
                    <span className="font-medium">{Math.min(endIndex, users.length)}</span> de{' '}
                    <span className="font-medium">{users.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-copilot shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-copilot border border-copilot-border-default bg-copilot-bg-secondary text-sm font-medium text-copilot-text-secondary hover:bg-copilot-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      ←
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-copilot-accent-primary border-copilot-accent-primary text-white'
                            : 'bg-copilot-bg-secondary border-copilot-border-default text-copilot-text-secondary hover:bg-copilot-bg-primary'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-copilot border border-copilot-border-default bg-copilot-bg-secondary text-sm font-medium text-copilot-text-secondary hover:bg-copilot-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Próximo</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-copilot-text-secondary">
            <span className="text-4xl mb-4 block">👥</span>
            <h3 className="text-lg font-medium text-copilot-text-primary mb-2">
              {users.length === 0 ? 'Nenhum usuário encontrado' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-copilot-text-secondary">
              {users.length === 0 
                ? 'Não há usuários cadastrados no sistema ainda.'
                : 'Tente ajustar os filtros de busca para encontrar usuários.'
              }
            </p>
            {users.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-copilot-accent-primary text-white rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors duration-200"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
