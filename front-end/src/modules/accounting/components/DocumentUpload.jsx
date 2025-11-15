import { useState, useEffect } from 'react';
import { accountingApi } from '../../../services/accountingApi';

/**
 * DocumentUpload Component
 *
 * Allows users to upload, view, and manage documents for a registration request.
 *
 * Features:
 * - Upload documents (PDF, JPG, PNG) up to 10MB
 * - List uploaded documents
 * - Delete documents (only uploader can delete)
 * - File validation (type and size)
 * - Loading and error states
 * - Real-time document list updates
 *
 * @param {Object} props
 * @param {string} props.requestId - Request ID to attach documents to
 * @param {string} props.currentUserId - Current user ID (for delete authorization)
 */
export default function DocumentUpload({ requestId, currentUserId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Common document types
  const documentTypes = [
    'RG',
    'CPF',
    'Comprovante de Residência',
    'Certidão de Casamento',
    'Título de Eleitor',
    'Contrato Social (se houver)',
    'Outro',
  ];

  // File validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  useEffect(() => {
    loadDocuments();
  }, [requestId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingApi.getRequestDocuments(requestId);
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Erro ao carregar documentos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Selecione um arquivo para upload');
      return;
    }

    if (!documentType) {
      setError('Selecione o tipo do documento');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(50); // Simulate progress

      await accountingApi.uploadDocument(requestId, selectedFile, documentType);

      setUploadProgress(100);

      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      document.getElementById('file-input').value = '';

      // Reload documents
      await loadDocuments();

      setUploadProgress(0);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Erro ao fazer upload: ' + err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Tem certeza que deseja deletar este documento?')) {
      return;
    }

    try {
      await accountingApi.deleteDocument(documentId);
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Erro ao deletar documento: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando documentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Erro:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Enviar Novo Documento</h3>

        <div className="space-y-4">
          {/* Document Type Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={uploading}
            >
              <option value="">Selecione...</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arquivo * (PDF, JPG, PNG - máx. 10MB)
            </label>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={uploading}
            />
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-600">
                Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !selectedFile || !documentType}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Enviando...' : 'Enviar Documento'}
          </button>
        </div>
      </form>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos Enviados</h3>

        {documents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600">Nenhum documento enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {doc.fileName.endsWith('.pdf') ? (
                      <svg
                        className="w-10 h-10 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-10 h-10 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Document Info */}
                  <div>
                    <p className="font-medium text-gray-800">{doc.documentType}</p>
                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} • Enviado em {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {/* Delete Button - Only show if user is uploader */}
                  {doc.uploadedBy === currentUserId && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
                      title="Deletar documento"
                    >
                      Deletar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
