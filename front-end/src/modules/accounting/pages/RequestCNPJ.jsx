import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../services/accountingApi';

/**
 * RequestCNPJ Page
 *
 * Form for users to request company (CNPJ) opening through an accountant.
 *
 * Flow:
 * 1. User fills out form with personal and business info
 * 2. Form is validated
 * 3. Request is created with status PENDING
 * 4. System will assign an accountant
 * 5. User is redirected to "My Requests" page
 */
export default function RequestCNPJ() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    email: '',
    phone: '',
    business_type: '',
    estimated_revenue: '',
    will_have_employees: false,
    preferred_company_type: 'MEI',
    has_commercial_address: false,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
    },
    urgency: 'medium',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.full_name || formData.full_name.length < 3) {
      setError('Nome completo é obrigatório (mínimo 3 caracteres)');
      return false;
    }

    if (!formData.cpf || !formData.cpf.match(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)) {
      setError('CPF inválido. Use o formato: 123.456.789-00');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }

    if (!formData.phone) {
      setError('Telefone é obrigatório');
      return false;
    }

    if (!formData.business_type) {
      setError('Tipo de negócio é obrigatório');
      return false;
    }

    if (!formData.estimated_revenue) {
      setError('Faturamento estimado é obrigatório');
      return false;
    }

    if (!formData.address.street || !formData.address.number || !formData.address.city || !formData.address.state || !formData.address.zip_code) {
      setError('Todos os campos de endereço são obrigatórios');
      return false;
    }

    if (!formData.address.zip_code.match(/^\d{5}-?\d{3}$/)) {
      setError('CEP inválido. Use o formato: 12345-678');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await accountingApi.createRequest(formData);
      setSuccess(true);

      // Redirect to My Requests after 2 seconds
      setTimeout(() => {
        navigate('/accounting/my-requests');
      }, 2000);
    } catch (err) {
      console.error('Erro ao criar solicitação:', err);
      setError(err.message || 'Erro ao criar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Solicitação enviada com sucesso!</h2>
          <p className="text-green-700">
            Em breve um contador entrará em contato com você.
          </p>
          <p className="text-green-600 text-sm mt-2">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Solicitar Abertura de CNPJ</h1>
        <p className="text-gray-600 mb-6">
          Preencha o formulário abaixo e um contador especializado entrará em contato.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Erro:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="123.456.789-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dados da Empresa */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Dados da Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Negócio *
                </label>
                <input
                  type="text"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  placeholder="Ex: Desenvolvimento de Software"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faturamento Estimado *
                </label>
                <select
                  name="estimated_revenue"
                  value={formData.estimated_revenue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Até R$ 10.000/mês">Até R$ 10.000/mês</option>
                  <option value="R$ 10.000 - R$ 50.000/mês">R$ 10.000 - R$ 50.000/mês</option>
                  <option value="R$ 50.000 - R$ 100.000/mês">R$ 50.000 - R$ 100.000/mês</option>
                  <option value="Acima de R$ 100.000/mês">Acima de R$ 100.000/mês</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Empresa Desejada *
                </label>
                <select
                  name="preferred_company_type"
                  value={formData.preferred_company_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="MEI">MEI (Microempreendedor Individual)</option>
                  <option value="EIRELI">EIRELI</option>
                  <option value="LTDA">LTDA</option>
                  <option value="SA">S/A (Sociedade Anônima)</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgência
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="will_have_employees"
                    checked={formData.will_have_employees}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Terá funcionários</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="has_commercial_address"
                    checked={formData.has_commercial_address}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Endereço comercial</span>
                </label>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                <input
                  type="text"
                  name="address.zip_code"
                  value={formData.address.zip_code}
                  onChange={handleChange}
                  placeholder="12345-678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                <input
                  type="text"
                  name="address.number"
                  value={formData.address.number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input
                  type="text"
                  name="address.complement"
                  value={formData.address.complement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  name="address.neighborhood"
                  value={formData.address.neighborhood}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="SP"
                  maxLength="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              maxLength="1000"
              placeholder="Informações adicionais que possam ajudar o contador..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.notes.length}/1000 caracteres</p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/accounting/my-requests')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Solicitação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
