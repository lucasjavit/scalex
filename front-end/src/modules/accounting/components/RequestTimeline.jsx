/**
 * RequestTimeline Component
 *
 * Visual timeline showing the progress of a CNPJ registration request.
 *
 * Steps:
 * 1. Solicitação Enviada (pending)
 * 2. Contador Atribuído (in_progress)
 * 3. Aguardando Documentos (waiting_documents)
 * 4. Processando (processing)
 * 5. CNPJ Obtido (completed)
 *
 * Props:
 * - request: CompanyRegistrationRequest object
 */
export default function RequestTimeline({ request }) {
  if (!request) {
    return null;
  }

  const steps = [
    {
      key: 'pending',
      label: 'Solicitação Enviada',
      icon: '📝',
      description: 'Sua solicitação foi recebida',
    },
    {
      key: 'in_progress',
      label: 'Contador Atribuído',
      icon: '👤',
      description: 'Um contador foi designado para você',
    },
    {
      key: 'waiting_documents',
      label: 'Documentos Solicitados',
      icon: '📄',
      description: 'Envie os documentos necessários',
    },
    {
      key: 'processing',
      label: 'Abrindo na Receita',
      icon: '⚙️',
      description: 'Processando abertura do CNPJ',
    },
    {
      key: 'completed',
      label: 'CNPJ Obtido',
      icon: '✅',
      description: 'Empresa criada com sucesso',
    },
  ];

  // Map status to step index
  const statusOrder = {
    pending: 0,
    in_progress: 1,
    waiting_documents: 2,
    processing: 3,
    completed: 4,
    cancelled: -1,
  };

  const currentStepIndex = statusOrder[request.status] ?? 0;

  // If cancelled, show special state
  if (request.status === 'cancelled') {
    return (
      <div className="card-copilot p-6">
        <div className="text-center py-8">
          <div className="inline-block bg-red-500/20 p-4 rounded-full mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold text-copilot-text-primary mb-2">
            Solicitação Cancelada
          </h3>
          <p className="text-copilot-text-secondary">
            Esta solicitação foi cancelada.
          </p>
          {request.statusNote && (
            <div className="mt-4 bg-copilot-bg-tertiary p-3 rounded text-sm text-copilot-text-secondary">
              <p className="font-medium mb-1 text-copilot-text-primary">Motivo:</p>
              <p>{request.statusNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-copilot p-6">
      <h2 className="text-xl font-semibold text-copilot-text-secondary mb-6">
        Progresso da Solicitação
      </h2>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-copilot-border-default"></div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.key} className="relative flex items-start">
                {/* Step icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                    isCompleted
                      ? 'bg-copilot-accent border-copilot-accent'
                      : isCurrent
                      ? 'bg-copilot-bg-secondary border-copilot-accent'
                      : 'bg-copilot-bg-secondary border-copilot-border-default'
                  }`}
                >
                  <span className={`text-xl ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                    {step.icon}
                  </span>
                </div>

                {/* Step content */}
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-semibold ${
                        isCompleted ? 'text-copilot-text-primary' : isCurrent ? 'text-copilot-accent' : 'text-copilot-text-tertiary'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {isCompleted && !isCurrent && (
                      <span className="text-green-400 text-sm font-medium">
                        Concluído ✓
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-3 py-1 bg-copilot-accent/20 text-copilot-accent text-sm font-medium rounded-full">
                        Em Andamento
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      isCompleted || isCurrent ? 'text-copilot-text-secondary' : 'text-copilot-text-tertiary'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Show status note for current step */}
                  {isCurrent && request.statusNote && (
                    <div className="mt-3 bg-copilot-accent/10 border border-copilot-accent/30 rounded p-3 text-sm text-copilot-accent">
                      <p className="font-medium mb-1">Nota do contador:</p>
                      <p>{request.statusNote}</p>
                    </div>
                  )}

                  {/* Show timestamp for completed steps */}
                  {isCompleted && (
                    <p className="mt-2 text-xs text-copilot-text-tertiary">
                      {index === 0 && request.createdAt && (
                        <>Criado em {new Date(request.createdAt).toLocaleString('pt-BR')}</>
                      )}
                      {index === currentStepIndex && request.updatedAt && (
                        <>Atualizado em {new Date(request.updatedAt).toLocaleString('pt-BR')}</>
                      )}
                      {step.key === 'completed' && request.completedAt && (
                        <>Concluído em {new Date(request.completedAt).toLocaleString('pt-BR')}</>
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated time remaining (optional) */}
      {currentStepIndex < 4 && (
        <div className="mt-8 pt-6 border-t border-copilot-border-default">
          <div className="flex items-center text-sm text-copilot-text-secondary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Tempo estimado para conclusão:{' '}
              <strong>
                {currentStepIndex === 0 && '1-2 dias úteis'}
                {currentStepIndex === 1 && '3-5 dias úteis'}
                {currentStepIndex === 2 && '1-3 dias úteis'}
                {currentStepIndex === 3 && '5-10 dias úteis'}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
