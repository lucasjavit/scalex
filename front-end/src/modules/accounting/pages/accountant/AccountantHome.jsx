import { useNavigate } from 'react-router-dom';
import { useUserStatus } from '../../../../hooks/useUserStatus';
import { useEffect } from 'react';
import BackButton from '../../../../components/BackButton';

export default function AccountantHome() {
  const navigate = useNavigate();
  const { userStatus, loading: userLoading } = useUserStatus();

  // Check if user has accountant role (partner_cnpj or admin)
  const isAccountant = userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin';

  // Redirect if user is not an accountant
  useEffect(() => {
    if (!userLoading && !isAccountant) {
      navigate('/home');
    }
  }, [userLoading, isAccountant, navigate]);

  // Show loading while checking user role
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // If user is not an accountant, show access denied (before redirect)
  if (!isAccountant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p>Você não tem permissão para acessar esta página.</p>
            <p className="text-sm mt-2">Apenas contadores (Parceiro: Abertura de CNPJ) e administradores podem acessar o dashboard do contador.</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <BackButton to="/home" />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard do Contador
          </h1>
          <p className="text-lg text-gray-600">
            Escolha uma área para gerenciar
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Solicitações Card */}
          <div
            onClick={() => navigate('/accounting/accountant/dashboard')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-400 transform hover:-translate-y-1"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Solicitações de CNPJ
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Gerencie solicitações de abertura de empresas
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Ver solicitações pendentes</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Processar documentação</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Acompanhar andamento</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Finalizar abertura de empresa</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                <span>Acessar Solicitações</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Empresas Card */}
          <div
            onClick={() => navigate('/accounting/accountant/companies')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-400 transform hover:-translate-y-1"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Empresas Ativas
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Gerencie empresas já cadastradas no sistema
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Buscar empresas por CPF</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Upload de impostos mensais</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Gerenciar documentos</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Acompanhar obrigações fiscais</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2">
                <span>Acessar Empresas</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Ações Rápidas</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/accounting/accountant/generate-tax')}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:shadow-md transition flex items-center space-x-2 text-gray-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Gerar Imposto</span>
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition flex items-center space-x-2 text-gray-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
