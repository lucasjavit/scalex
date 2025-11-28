import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import accountingApi from '../../../../services/accountingApi';

/**
 * GenerateTax Component
 *
 * Page for accountants to generate tax obligations for their managed companies.
 *
 * Features:
 * - Select company from dropdown (loads accountant's companies)
 * - Select tax type (DAS, DARF, GPS, ISS, ICMS, etc)
 * - Set reference period (month/year)
 * - Set due date
 * - Enter amount
 * - Optional: Enter barcode
 * - Optional: Upload PDF file
 *
 * Form validation:
 * - All required fields must be filled
 * - Amount must be positive
 * - Due date must be in the future (warning only)
 */
export default function GenerateTax() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pre-selected company from navigation state (if coming from company list)
  const preSelectedCompanyId = location.state?.companyId || '';

  // Form state
  const [formData, setFormData] = useState({
    companyId: preSelectedCompanyId,
    taxType: '',
    referencePeriod: '', // YYYY-MM format
    dueDate: '',
    amount: '',
    barcode: '',
    notes: '',
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Tax types available in Brazil
  const taxTypes = [
    { value: 'DAS', label: 'DAS - Documento de Arrecadação do Simples Nacional' },
    { value: 'DARF', label: 'DARF - Documento de Arrecadação de Receitas Federais' },
    { value: 'GPS', label: 'GPS - Guia da Previdência Social' },
    { value: 'ISS', label: 'ISS - Imposto Sobre Serviços' },
    { value: 'ICMS', label: 'ICMS - Imposto sobre Circulação de Mercadorias' },
    { value: 'IRPJ', label: 'IRPJ - Imposto de Renda Pessoa Jurídica' },
    { value: 'CSLL', label: 'CSLL - Contribuição Social sobre o Lucro Líquido' },
    { value: 'PIS', label: 'PIS - Programa de Integração Social' },
    { value: 'COFINS', label: 'COFINS - Contribuição para Financiamento da Seguridade Social' },
    { value: 'FGTS', label: 'FGTS - Fundo de Garantia do Tempo de Serviço' },
    { value: 'OUTROS', label: 'Outros' },
  ];

  // Load accountant's companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await accountingApi.getAccountantCompanies('active');
      setCompanies(data);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('Erro ao carregar empresas: ' + err.message);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um arquivo PDF.');
        e.target.value = '';
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB.');
        e.target.value = '';
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.companyId) {
      alert('Por favor, selecione uma empresa.');
      return;
    }

    if (!formData.taxType) {
      alert('Por favor, selecione o tipo de imposto.');
      return;
    }

    if (!formData.referencePeriod) {
      alert('Por favor, informe o período de referência.');
      return;
    }

    if (!formData.dueDate) {
      alert('Por favor, informe a data de vencimento.');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor, informe um valor válido.');
      return;
    }

    // Warning if due date is in the past
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      const confirmPast = window.confirm(
        'A data de vencimento está no passado. Deseja continuar mesmo assim?'
      );
      if (!confirmPast) return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create tax obligation
      const taxData = {
        companyId: formData.companyId,
        taxType: formData.taxType,
        referencePeriod: formData.referencePeriod,
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount),
        barcode: formData.barcode || null,
        notes: formData.notes || null,
        status: 'pending',
      };

      const createdTax = await accountingApi.createTaxObligation(taxData);

      // TODO: Upload PDF file if provided (requires backend endpoint)
      // For now, we'll skip file upload and just create the tax obligation
      if (pdfFile) {
        console.log('PDF file upload not yet implemented:', pdfFile.name);
        // Future implementation:
        // await accountingApi.uploadTaxPDF(createdTax.id, pdfFile);
      }

      setSuccess(true);

      // Show success message
      alert('Imposto gerado com sucesso!');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/accounting/accountant/companies');
      }, 2000);
    } catch (err) {
      console.error('Error creating tax obligation:', err);
      setError('Erro ao gerar imposto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (loadingCompanies) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma empresa ativa</h3>
          <p className="mt-2 text-sm text-gray-500">
            Você não possui empresas ativas atribuídas a você.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/accounting/accountant')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerar Imposto</h1>
        <p className="mt-2 text-sm text-gray-600">
          Preencha os dados abaixo para gerar uma nova guia de imposto para a empresa.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-green-800">
              Imposto gerado com sucesso! Redirecionando...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {/* Company Selection */}
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
              Empresa <span className="text-red-500">*</span>
            </label>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.legalName} - {company.cnpj || 'CNPJ em processamento'}
                </option>
              ))}
            </select>
          </div>

          {/* Tax Type */}
          <div>
            <label htmlFor="taxType" className="block text-sm font-medium text-gray-700">
              Tipo de Imposto <span className="text-red-500">*</span>
            </label>
            <select
              id="taxType"
              name="taxType"
              value={formData.taxType}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione o tipo</option>
              {taxTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Period and Due Date - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference Period */}
            <div>
              <label htmlFor="referencePeriod" className="block text-sm font-medium text-gray-700">
                Período de Referência <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                id="referencePeriod"
                name="referencePeriod"
                value={formData.referencePeriod}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Mês/Ano de competência</p>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Data de Vencimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Barcode (Optional) */}
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
              Código de Barras (Opcional)
            </label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              placeholder="Ex: 34191.09065 61713.001019 00190.991092 4 95370000012345"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Código de barras ou linha digitável da guia
            </p>
          </div>

          {/* PDF Upload (Optional) */}
          <div>
            <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
              Upload da Guia (PDF - Opcional)
            </label>
            <input
              type="file"
              id="pdfFile"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {pdfFile && (
              <p className="mt-2 text-sm text-green-600">
                Arquivo selecionado: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Arquivo PDF da guia de pagamento (máx: 10MB)
            </p>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Observações (Opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              maxLength={500}
              placeholder="Informações adicionais sobre este imposto..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {formData.notes.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Gerando...' : 'Gerar Imposto'}
          </button>
        </div>
      </form>
    </div>
  );
}
