import { useState } from 'react';
import { accountingApi } from '../../../services/accountingApi';

/**
 * CompanyForm Component
 *
 * Form for accountants to register a company after successful CNPJ opening.
 * Called when accountant completes the registration process.
 *
 * Features:
 * - Comprehensive company information form
 * - CNPJ validation
 * - Address input with validation
 * - Creates company and marks request as COMPLETED
 * - Error handling and loading states
 *
 * @param {Object} props
 * @param {string} props.requestId - Registration request ID
 * @param {Object} props.request - Request data for pre-filling form
 * @param {Function} props.onSuccess - Callback when company is created
 * @param {Function} props.onCancel - Callback to cancel form
 */
export default function CompanyForm({ requestId, request, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    legalName: '',
    tradeName: request?.desiredTradeName || '',
    cnpj: '',
    companyType: request?.desiredCompanyType || 'LTDA',
    mainActivity: request?.mainActivityDescription || '',
    taxRegime: 'SIMPLES_NACIONAL',
    openingDate: '',
    estimatedRevenue: request?.estimatedRevenue || 0,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    stateRegistration: '',
    municipalRegistration: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Company types
  const companyTypes = [
    { value: 'MEI', label: 'MEI - Microempreendedor Individual' },
    { value: 'ME', label: 'ME - Microempresa' },
    { value: 'EIRELI', label: 'EIRELI - Empresa Individual de Responsabilidade Limitada' },
    { value: 'LTDA', label: 'LTDA - Sociedade Limitada' },
    { value: 'SA', label: 'SA - Sociedade Anônima' },
  ];

  // Tax regimes
  const taxRegimes = [
    { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
    { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
    { value: 'LUCRO_REAL', label: 'Lucro Real' },
  ];

  // Brazilian states
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const formatCNPJ = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Format as XX.XXX.XXX/XXXX-XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const handleCNPJChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData((prev) => ({ ...prev, cnpj: formatted }));
  };

  const formatZipCode = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const handleZipCodeChange = (e) => {
    const formatted = formatZipCode(e.target.value);
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, zipCode: formatted },
    }));
  };

  const validateForm = () => {
    // Validate required fields
    if (!formData.legalName.trim()) {
      setError('Razão Social é obrigatória');
      return false;
    }

    if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14) {
      setError('CNPJ inválido. Deve conter 14 dígitos.');
      return false;
    }

    if (!formData.mainActivity.trim()) {
      setError('Atividade Principal é obrigatória');
      return false;
    }

    if (!formData.openingDate) {
      setError('Data de Abertura é obrigatória');
      return false;
    }

    // Validate address
    if (!formData.address.street.trim()) {
      setError('Endereço (Rua) é obrigatório');
      return false;
    }

    if (!formData.address.number.trim()) {
      setError('Número é obrigatório');
      return false;
    }

    if (!formData.address.neighborhood.trim()) {
      setError('Bairro é obrigatório');
      return false;
    }

    if (!formData.address.city.trim()) {
      setError('Cidade é obrigatória');
      return false;
    }

    if (!formData.address.state) {
      setError('Estado é obrigatório');
      return false;
    }

    if (!formData.address.zipCode || formData.address.zipCode.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido. Deve conter 8 dígitos.');
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

    try {
      setLoading(true);

      const companyData = {
        ...formData,
        estimatedRevenue: Number(formData.estimatedRevenue),
      };

      const company = await accountingApi.createCompany(requestId, companyData);

      // Success
      if (onSuccess) {
        onSuccess(company);
      }
    } catch (err) {
      console.error('Error creating company:', err);
      setError(err.message || 'Erro ao criar empresa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Empresa</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Erro:</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <input
                type="text"
                name="tradeName"
                value={formData.tradeName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="XX.XXX.XXX/XXXX-XX"
                maxLength={18}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Empresa *
              </label>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                {companyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regime Tributário *
              </label>
              <select
                name="taxRegime"
                value={formData.taxRegime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                {taxRegimes.map((regime) => (
                  <option key={regime.value} value={regime.value}>
                    {regime.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atividade Principal (CNAE) *
              </label>
              <input
                type="text"
                name="mainActivity"
                value={formData.mainActivity}
                onChange={handleChange}
                placeholder="Ex: 6201-5/00 - Desenvolvimento de programas de computador sob encomenda"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Abertura *
              </label>
              <input
                type="date"
                name="openingDate"
                value={formData.openingDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faturamento Estimado Anual (R$) *
              </label>
              <input
                type="number"
                name="estimatedRevenue"
                value={formData.estimatedRevenue}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Endereço</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
              <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                type="text"
                name="number"
                value={formData.address.number}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                type="text"
                name="complement"
                value={formData.address.complement}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.address.neighborhood}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="">Selecione...</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={handleZipCodeChange}
                placeholder="XXXXX-XXX"
                maxLength={9}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Optional Registrations */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Inscrições (Opcional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Estadual
              </label>
              <input
                type="text"
                name="stateRegistration"
                value={formData.stateRegistration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Municipal
              </label>
              <input
                type="text"
                name="municipalRegistration"
                value={formData.municipalRegistration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Criando Empresa...' : 'Criar Empresa'}
          </button>
        </div>
      </form>
    </div>
  );
}
