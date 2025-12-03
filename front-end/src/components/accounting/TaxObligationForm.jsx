import React, { useState } from 'react';
import { accountingApi } from '../../services/accountingApi';

/**
 * TaxObligationForm Component
 *
 * Form for accountants to create and manage tax obligations for companies.
 *
 * Features:
 * - Create new tax obligations with all required fields
 * - Select tax type from Brazilian tax options (DAS, DARF, GPS, ISS, etc.)
 * - Calculate total amount automatically (amount + fine + interest)
 * - Input barcode, payment link, and document URL
 * - Add optional notes for the company
 * - Validation for all required fields
 * - Responsive design with Tailwind CSS
 */
const TaxObligationForm = ({ companyId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyId: companyId,
    taxType: 'DAS',
    referenceMonth: '',
    dueDate: '',
    amount: '',
    fineAmount: '0',
    interestAmount: '0',
    barcode: '',
    paymentLink: '',
    documentUrl: '',
    notes: '',
  });

  const taxTypes = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const fine = parseFloat(formData.fineAmount) || 0;
    const interest = parseFloat(formData.interestAmount) || 0;
    return amount + fine + interest;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data
      const taxData = {
        companyId: formData.companyId,
        taxType: formData.taxType,
        referenceMonth: formData.referenceMonth,
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount),
        fineAmount: parseFloat(formData.fineAmount) || 0,
        interestAmount: parseFloat(formData.interestAmount) || 0,
        barcode: formData.barcode || undefined,
        paymentLink: formData.paymentLink || undefined,
        documentUrl: formData.documentUrl || undefined,
        notes: formData.notes || undefined,
      };

      await accountingApi.createTaxObligation(taxData);

      // Reset form and notify parent
      setFormData({
        companyId: companyId,
        taxType: 'DAS',
        referenceMonth: '',
        dueDate: '',
        amount: '',
        fineAmount: '0',
        interestAmount: '0',
        barcode: '',
        paymentLink: '',
        documentUrl: '',
        notes: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating tax obligation:', err);
      setError(err.message || 'Failed to create tax obligation');
    } finally {
      setLoading(false);
    }
  };

  // Generate reference month options (last 12 months + next 3 months)
  const getReferenceMonthOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = -12; i <= 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }

    return options;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Gerar Nova Obrigação Fiscal
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tax Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Imposto *
          </label>
          <select
            name="taxType"
            value={formData.taxType}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {taxTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reference Month and Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês de Referência *
            </label>
            <select
              name="referenceMonth"
              value={formData.referenceMonth}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o mês</option>
              {getReferenceMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Amount, Fine, Interest */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Base (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Multa (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="fineAmount"
              value={formData.fineAmount}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Juros (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="interestAmount"
              value={formData.interestAmount}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Total Amount Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900">Valor Total:</span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(calculateTotalAmount())}
            </span>
          </div>
        </div>

        {/* Barcode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código de Barras
          </label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            maxLength={100}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            placeholder="Digite o código de barras do boleto"
          />
        </div>

        {/* Payment Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link de Pagamento
          </label>
          <input
            type="url"
            name="paymentLink"
            value={formData.paymentLink}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        {/* Document URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL do Documento (PDF)
          </label>
          <input
            type="url"
            name="documentUrl"
            value={formData.documentUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Link para o documento da obrigação fiscal (guia de pagamento)
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Informações adicionais para o cliente..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Gerando...' : 'Gerar Obrigação'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaxObligationForm;
