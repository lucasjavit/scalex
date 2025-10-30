import { auth } from '../modules/auth-social/services/firebaseAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Admin Service - Gerenciamento de usuários e roles (apenas admin)
 */

/**
 * Obter token Firebase do usuário autenticado
 */
const getAuthToken = async () => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  return await auth.currentUser.getIdToken();
};

/**
 * Buscar todos os usuários
 * @returns {Promise<Array>} Lista de usuários
 */
export const getAllUsers = async () => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

/**
 * Buscar usuários por role específica
 * @param {string} role - Role a filtrar (user, admin, partner_*)
 * @returns {Promise<Array>} Lista de usuários com a role
 */
export const getUsersByRole = async (role) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/users/admin/roles/${role}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users with role: ${role}`);
  }

  return response.json();
};

/**
 * Atualizar role de um usuário (apenas admin)
 * @param {string} userId - ID do usuário
 * @param {string} newRole - Nova role
 * @returns {Promise<Object>} Usuário atualizado
 */
export const updateUserRole = async (userId, newRole) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/users/admin/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: newRole }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user role');
  }

  return response.json();
};

/**
 * Buscar dados do usuário atual (para verificar se é admin)
 * @returns {Promise<Object>} Dados do usuário
 */
export const getCurrentUserData = async () => {
  const token = await getAuthToken();
  const firebaseUid = auth.currentUser.uid;

  const response = await fetch(`${API_URL}/users/firebase/${firebaseUid}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current user data');
  }

  return response.json();
};

/**
 * Verificar se o usuário atual é admin
 * All roles except 'user' can access admin routes
 * @returns {Promise<boolean>}
 */
export const isCurrentUserAdmin = async () => {
  try {
    const userData = await getCurrentUserData();
    return userData && userData.role !== 'user';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Lista de todas as roles disponíveis
 */
export const AVAILABLE_ROLES = [
  { value: 'user', label: 'Usuário', description: 'Usuário padrão da plataforma' },
  { value: 'admin', label: 'Administrador', description: 'Acesso total à plataforma' },
  { value: 'partner_english_course', label: 'Partner - Curso de Inglês', description: 'Gerencia o módulo de inglês' },
  { value: 'partner_cnpj', label: 'Partner - CNPJ', description: 'Gerencia o módulo de abertura de CNPJ' },
  { value: 'partner_remittance', label: 'Partner - Remessas', description: 'Gerencia o módulo de remessas internacionais' },
  { value: 'partner_resume', label: 'Partner - Currículo', description: 'Gerencia o módulo de currículo internacional' },
  { value: 'partner_interview', label: 'Partner - Entrevistas', description: 'Gerencia o módulo de simulação de entrevistas' },
  { value: 'partner_networking', label: 'Partner - Networking', description: 'Gerencia o módulo de networking/LinkedIn' },
  { value: 'partner_job_marketplace', label: 'Partner - Marketplace', description: 'Gerencia o marketplace de vagas' },
  { value: 'partner_community', label: 'Partner - Comunidade', description: 'Gerencia a comunidade premium' },
];

/**
 * Obter informações de uma role específica
 * @param {string} roleValue
 * @returns {Object|null}
 */
export const getRoleInfo = (roleValue) => {
  return AVAILABLE_ROLES.find(role => role.value === roleValue) || null;
};
