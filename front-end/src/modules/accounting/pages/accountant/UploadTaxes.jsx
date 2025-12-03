import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accountingApi } from '../../../../services/accountingApi';
import { useUserStatus } from '../../../../hooks/useUserStatus';
import BackButton from '../../../../components/BackButton';

const TAX_TYPES = [
  { value: 'DAS', label: 'DAS - Simples Nacional' },
  { value: 'DARF', label: 'DARF - Receitas Federais' },
  { value: 'GPS', label: 'GPS - Previdência Social' },
  { value: 'ISS', label: 'ISS - Imposto Sobre Serviços' },
  { value: 'ICMS', label: 'ICMS - Circulação de Mercadorias' },
  { value: 'IRPJ', label: 'IRPJ - Imposto de Renda PJ' },
  { value: 'CSLL', label: 'CSLL - Contribuição Social' },
  { value: 'PIS', label: 'PIS - Programa de Integração Social' },
  { value: 'COFINS', label: 'COFINS - Financiamento da Seguridade' },
  { value: 'INSS', label: 'INSS - Instituto Nacional do Seguro Social' },
  { value: 'FGTS', label: 'FGTS - Fundo de Garantia' },
];

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export default function UploadTaxes() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { userStatus } = useUserStatus();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    taxType: 'DAS',
    referenceMonth: new Date().getMonth() + 1,
    referenceYear: new Date().getFullYear(),
    dueDate: '',
    amount: '',
    barcode: '',
    notes: '',
  });
  const [file, setFile] = useState(null);

  const isAccountant = userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin';

  useEffect(() => {
    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await accountingApi.getCompanyById(companyId);
      setCompany(data);
    } catch (err) {
      console.error('Error loading company:', err);
      setError('Erro ao carregar dados da empresa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
        e.target.value = '';
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecione um arquivo PDF');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Por favor, informe um valor válido');
      return;
    }

    if (!formData.dueDate) {
      setError('Por favor, informe a data de vencimento');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const taxData = {
        companyId,
        taxType: formData.taxType,
        referenceMonth: parseInt(formData.referenceMonth),
        referenceYear: parseInt(formData.referenceYear),
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount),
        fineAmount: 0,
        interestAmount: 0,
        barcode: formData.barcode || null,
        paymentLink: null,
        notes: formData.notes || null,
      };

      await accountingApi.uploadMonthlyTaxPdf(taxData, file);

      setSuccess('Imposto cadastrado com sucesso!');

      // Reset form
      setFormData({
        taxType: 'DAS',
        referenceMonth: new Date().getMonth() + 1,
        referenceYear: new Date().getFullYear(),
        dueDate: '',
        amount: '',
        barcode: '',
        notes: '',
      });
      setFile(null);
      document.getElementById('file-input').value = '';

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/accounting/accountant/companies');
      }, 2000);
    } catch (err) {
      console.error('Error uploading tax:', err);
      setError(err.message || 'Erro ao fazer upload do imposto');
    } finally {
      setUploading(false);
    }
  };

  const formatCnpj = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  if (!isAccountant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Apenas contadores têm acesso a esta página.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackButton to="/accounting/accountant/companies" />
          <h1 className="text-3xl font-bold text-gray-900">Upload de Imposto Mensal</h1>
          {company && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">{company.legalName}</h2>
              <p className="text-gray-600">CNPJ: {formatCnpj(company.cnpj)}</p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Imposto *
              </label>
              <select
                name="taxType"
                value={formData.taxType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {TAX_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês de Referência *
              </label>
              <select
                name="referenceMonth"
                value={formData.referenceMonth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano de Referência *
              </label>
              <input
                type="number"
                name="referenceYear"
                value={formData.referenceYear}
                onChange={handleInputChange}
                min="2000"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vencimento *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Imposto (R$) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Barcode */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="Ex: 12345678901234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* PDF File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo PDF do Imposto *
              </label>
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Arquivo PDF, tamanho máximo: 10MB
              </p>
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Informações adicionais sobre o imposto..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fazendo Upload...
                </span>
              ) : (
                'Fazer Upload do Imposto'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/accounting/accountant/companies')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
