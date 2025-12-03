import React, { useState, useEffect } from 'react';
import { accountingApi } from '../../services/accountingApi';

/**
 * TaxObligationsList Component
 *
 * Displays tax obligations for a specific company with filtering and payment confirmation.
 * Used by company owners to view and manage their tax obligations.
 *
 * Features:
 * - List all tax obligations with status badges
 * - Filter by status (all, pending, paid, overdue, cancelled)
 * - Display payment details (barcode, payment link, due date)
 * - Confirm payment with receipt number
 * - Visual indicators for overdue taxes
 * - Responsive design with Tailwind CSS
 */
const TaxObligationsList = ({ companyId }) => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paidAmount: '',
    paymentConfirmation: '',
  });

  useEffect(() => {
    if (companyId) {
      loadTaxObligations();
    }
  }, [companyId, statusFilter]);

  const loadTaxObligations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingApi.getCompanyTaxObligations(companyId, statusFilter);
      setTaxes(data);
    } catch (err) {
      console.error('Error loading tax obligations:', err);
      setError(err.message || 'Failed to load tax obligations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (taxId) => {
    try {
      setError(null);
      const paymentData = {
        paidAmount: parseFloat(paymentForm.paidAmount),
        paymentConfirmation: paymentForm.paymentConfirmation || undefined,
      };

      await accountingApi.confirmTaxPayment(taxId, paymentData);

      // Reset form and reload
      setConfirmingPayment(null);
      setPaymentForm({ paidAmount: '', paymentConfirmation: '' });
      await loadTaxObligations();
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.message || 'Failed to confirm payment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTaxTypeLabel = (taxType) => {
    const types = {
      DAS: 'DAS - Simples Nacional',
      DARF: 'DARF - Receitas Federais',
      GPS: 'GPS - Previdência Social',
      ISS: 'ISS - Imposto Sobre Serviços',
      ICMS: 'ICMS - Circulação de Mercadorias',
      IRPJ: 'IRPJ - Imposto de Renda PJ',
      CSLL: 'CSLL - Contribuição Social',
      PIS: 'PIS - Programa de Integração Social',
      COFINS: 'COFINS - Financiamento da Seguridade',
      INSS: 'INSS - Instituto Nacional do Seguro Social',
      FGTS: 'FGTS - Fundo de Garantia',
    };
    return types[taxType] || taxType;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Código de barras copiado!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Obrigações Fiscais</h3>

        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1 text-sm rounded ${
              statusFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 text-sm rounded ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 text-sm rounded ${
              statusFilter === 'paid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pagas
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tax obligations list */}
      {taxes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma obrigação fiscal encontrada
        </div>
      ) : (
        <div className="space-y-3">
          {taxes.map((tax) => (
            <div
              key={tax.id}
              className={`border rounded-lg p-4 ${
                isOverdue(tax.dueDate, tax.status)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {getTaxTypeLabel(tax.taxType)}
                    </h4>
                    {getStatusBadge(tax.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Referência: {tax.referenceMonth}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(tax.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Vencimento: {formatDate(tax.dueDate)}
                  </p>
                  {isOverdue(tax.dueDate, tax.status) && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      VENCIDO
                    </p>
                  )}
                </div>
              </div>

              {/* Amount breakdown */}
              {(tax.fineAmount > 0 || tax.interestAmount > 0) && (
                <div className="text-sm text-gray-600 mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Valor base:</span>
                    <span>{formatCurrency(tax.amount)}</span>
                  </div>
                  {tax.fineAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Multa:</span>
                      <span className="text-red-600">{formatCurrency(tax.fineAmount)}</span>
                    </div>
                  )}
                  {tax.interestAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Juros:</span>
                      <span className="text-red-600">{formatCurrency(tax.interestAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Barcode */}
              {tax.barcode && (
                <div className="mb-3">
                  <label className="text-xs text-gray-600 block mb-1">Código de Barras:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tax.barcode}
                      readOnly
                      className="flex-1 text-sm border rounded px-2 py-1 bg-gray-50 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(tax.barcode)}
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* Payment link */}
              {tax.paymentLink && (
                <div className="mb-3">
                  <a
                    href={tax.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🔗 Acessar link de pagamento
                  </a>
                </div>
              )}

              {/* Document URL */}
              {tax.documentUrl && (
                <div className="mb-3">
                  <a
                    href={tax.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    📄 Baixar documento (PDF)
                  </a>
                </div>
              )}

              {/* Notes */}
              {tax.notes && (
                <div className="mb-3">
                  <label className="text-xs text-gray-600 block mb-1">Observações:</label>
                  <p className="text-sm text-gray-700">{tax.notes}</p>
                </div>
              )}

              {/* Payment confirmation section */}
              {tax.status === 'pending' && confirmingPayment !== tax.id && (
                <button
                  onClick={() => {
                    setConfirmingPayment(tax.id);
                    setPaymentForm({ paidAmount: tax.totalAmount.toString(), paymentConfirmation: '' });
                  }}
                  className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirmar Pagamento
                </button>
              )}

              {confirmingPayment === tax.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <h5 className="font-semibold text-sm mb-2">Confirmar Pagamento</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Valor Pago *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentForm.paidAmount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Número de Confirmação (opcional)
                      </label>
                      <input
                        type="text"
                        value={paymentForm.paymentConfirmation}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentConfirmation: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Ex: NSU 123456"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmPayment(tax.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => {
                          setConfirmingPayment(null);
                          setPaymentForm({ paidAmount: '', paymentConfirmation: '' });
                        }}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Paid information */}
              {tax.status === 'paid' && (
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>✓ Pago em:</strong> {formatDate(tax.paidAt)}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Valor pago:</strong> {formatCurrency(tax.paidAmount)}
                  </p>
                  {tax.paymentConfirmation && (
                    <p className="text-sm text-green-800">
                      <strong>Confirmação:</strong> {tax.paymentConfirmation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxObligationsList;
