import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddButton from '../../../components/AddButton';
import BackButton from '../../../components/BackButton';
import { useNotification } from '../../../hooks/useNotification';
import courseApiService from '../../english-learning/course/services/courseApi';
import AdminLayout from '../components/AdminLayout';

const EnglishCourseAdmin = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stages');
  const [showStageModal, setShowStageModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [stageForm, setStageForm] = useState({ title: '', description: '', orderIndex: stages.length + 1 });
  const [unitForm, setUnitForm] = useState({ title: '', description: '', youtubeUrl: '', videoDuration: '', orderIndex: 1 });
  const [cardForm, setCardForm] = useState({ question: '', answer: '', exampleSentence: '', orderIndex: 1 });

  useEffect(() => {
    if (activeTab === 'stages') {
      loadStages();
    } else if (activeTab === 'units' && selectedStage) {
      loadUnits();
    } else if (activeTab === 'cards' && selectedUnit) {
      loadCards();
    }
  }, [activeTab, selectedStage, selectedUnit]);

  const loadStages = async () => {
    try {
      setLoading(true);
      const data = await courseApiService.getAllStages();
      // Sort stages by orderIndex
      const sortedData = data.sort((a, b) => a.orderIndex - b.orderIndex);
      setStages(sortedData);
    } catch (error) {
      console.error('Error loading stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    if (!selectedStage) return;
    try {
      setLoading(true);
      const data = await courseApiService.getUnitsByStage(selectedStage.id);
      // Sort units by orderIndex
      const sortedData = data.sort((a, b) => a.orderIndex - b.orderIndex);
      setUnits(sortedData);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    if (!selectedUnit) return;
    try {
      setLoading(true);
      const data = await courseApiService.getCardsByUnit(selectedUnit.id);
      // Sort cards by orderIndex
      const sortedData = data.sort((a, b) => a.orderIndex - b.orderIndex);
      setCards(sortedData);
    } catch (error) {
      console.error('Error loading cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setActiveTab('units');
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setActiveTab('cards');
  };

  const handleDelete = async (type, id) => {
    const typeNames = {
      'stage': 'estágio',
      'unit': 'unidade',
      'card': 'card'
    };
    
    showConfirmation(
      `Tem certeza que deseja excluir este ${typeNames[type]}? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          if (type === 'stage') {
            await courseApiService.deleteStage(id);
            await loadStages();
            showSuccess(`${typeNames[type]} excluído com sucesso!`);
          } else if (type === 'unit') {
            await courseApiService.deleteUnit(id);
            await loadUnits();
            showSuccess(`${typeNames[type]} excluído com sucesso!`);
          } else if (type === 'card') {
            await courseApiService.deleteCard(id);
            await loadCards();
            showSuccess(`${typeNames[type]} excluído com sucesso!`);
          }
        } catch (error) {
          console.error(`Error deleting ${type}:`, error);
          showError(`Erro ao excluir ${typeNames[type]}`);
        }
      }
    );
  };

  const handleCreateStage = async () => {
    try {
      await courseApiService.createStage(stageForm);
      setShowStageModal(false);
      setStageForm({ title: '', description: '', orderIndex: stages.length + 1 });
      await loadStages();
      showSuccess('Estágio criado com sucesso!');
    } catch (error) {
      console.error('Error creating stage:', error);
      showError('Erro ao criar estágio');
    }
  };

  const handleCreateUnit = async () => {
    try {
      await courseApiService.createUnit({
        ...unitForm,
        stageId: selectedStage.id,
        videoDuration: parseInt(unitForm.videoDuration),
      });
      setShowUnitModal(false);
      setUnitForm({ title: '', description: '', youtubeUrl: '', videoDuration: '', orderIndex: 1 });
      await loadUnits();
      showSuccess('Unidade criada com sucesso!');
    } catch (error) {
      console.error('Error creating unit:', error);
      showError('Erro ao criar unidade');
    }
  };

  const handleCreateCard = async () => {
    try {
      await courseApiService.createCard({
        ...cardForm,
        unitId: selectedUnit.id,
      });
      setShowCardModal(false);
      setCardForm({ question: '', answer: '', exampleSentence: '', orderIndex: 1 });
      await loadCards();
      showSuccess('Card criado com sucesso!');
    } catch (error) {
      console.error('Error creating card:', error);
      showError('Erro ao criar card');
    }
  };

  const handleEditStage = (stage) => {
    setEditingStage(stage);
    setStageForm({ title: stage.title, description: stage.description, orderIndex: stage.orderIndex });
    setShowStageModal(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitForm({ 
      title: unit.title, 
      description: unit.description, 
      youtubeUrl: unit.youtubeUrl, 
      videoDuration: unit.videoDuration, 
      orderIndex: unit.orderIndex 
    });
    setShowUnitModal(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setCardForm({ 
      question: card.question, 
      answer: card.answer, 
      exampleSentence: card.exampleSentence || '', 
      orderIndex: card.orderIndex 
    });
    setShowCardModal(true);
  };

  const handleUpdateStage = async () => {
    try {
      await courseApiService.updateStage(editingStage.id, stageForm);
      setShowStageModal(false);
      setEditingStage(null);
      setStageForm({ title: '', description: '', orderIndex: stages.length + 1 });
      await loadStages();
      showSuccess('Estágio atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating stage:', error);
      showError('Erro ao atualizar estágio');
    }
  };

  const handleUpdateUnit = async () => {
    try {
      await courseApiService.updateUnit(editingUnit.id, {
        ...unitForm,
        videoDuration: parseInt(unitForm.videoDuration),
      });
      setShowUnitModal(false);
      setEditingUnit(null);
      setUnitForm({ title: '', description: '', youtubeUrl: '', videoDuration: '', orderIndex: 1 });
      await loadUnits();
      showSuccess('Unidade atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating unit:', error);
      showError('Erro ao atualizar unidade');
    }
  };

  const handleUpdateCard = async () => {
    try {
      await courseApiService.updateCard(editingCard.id, cardForm);
      setShowCardModal(false);
      setEditingCard(null);
      setCardForm({ question: '', answer: '', exampleSentence: '', orderIndex: 1 });
      await loadCards();
      showSuccess('Card atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating card:', error);
      showError('Erro ao atualizar card');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <BackButton to="/admin" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            📚 English Course Management
          </h1>
          <p className="text-copilot-text-secondary">
            Manage stages, units, and cards
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-copilot-border-default">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('stages');
                setSelectedStage(null);
                setSelectedUnit(null);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'stages'
                  ? 'border-b-2 border-copilot-accent-primary text-copilot-accent-primary'
                  : 'text-copilot-text-secondary hover:text-copilot-text-primary'
              }`}
            >
              Stages ({stages.length})
            </button>
            <button
              onClick={() => selectedStage && setActiveTab('units')}
              disabled={!selectedStage}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'units'
                  ? 'border-b-2 border-copilot-accent-primary text-copilot-accent-primary'
                  : selectedStage
                  ? 'text-copilot-text-secondary hover:text-copilot-text-primary'
                  : 'text-copilot-text-tertiary cursor-not-allowed'
              }`}
            >
              Units {selectedStage && `(${units.length})`}
            </button>
            <button
              onClick={() => selectedUnit && setActiveTab('cards')}
              disabled={!selectedUnit}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'cards'
                  ? 'border-b-2 border-copilot-accent-primary text-copilot-accent-primary'
                  : selectedUnit
                  ? 'text-copilot-text-secondary hover:text-copilot-text-primary'
                  : 'text-copilot-text-tertiary cursor-not-allowed'
              }`}
            >
              Cards {selectedUnit && `(${cards.length})`}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary"></div>
          </div>
        ) : activeTab === 'stages' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-copilot-text-primary">Stages</h2>
              <AddButton 
                onClick={() => setShowStageModal(true)}
                label="Add Stage"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 cursor-pointer hover:border-copilot-accent-primary transition-colors"
                  onClick={() => handleStageClick(stage)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-copilot flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{stage.orderIndex}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStage(stage);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('stage', stage.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-copilot-text-primary mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-copilot-text-secondary text-sm mb-4">
                    {stage.description}
                  </p>
                  <div className="text-sm text-copilot-text-secondary">
                    {stage.totalUnits || 0} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'units' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <BackButton
                  onClick={() => {
                    setActiveTab('stages');
                    setSelectedStage(null);
                  }}
                  label="Back to Stages"
                />
                <h2 className="text-2xl font-bold text-copilot-text-primary">
                  Units - {selectedStage?.title}
                </h2>
              </div>
              <AddButton 
                onClick={() => setShowUnitModal(true)}
                label="Add Unit"
              />
            </div>
            <div className="space-y-4">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 cursor-pointer hover:border-copilot-accent-primary transition-colors"
                  onClick={() => handleUnitClick(unit)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-copilot-text-primary mb-2">
                        Unit {unit.orderIndex}: {unit.title}
                      </h3>
                      <p className="text-copilot-text-secondary text-sm mb-2">
                        {unit.description}
                      </p>
                      <div className="flex gap-4 text-sm text-copilot-text-secondary">
                        <span>Duration: {Math.floor(unit.videoDuration / 60)} min</span>
                        <span>•</span>
                        <span>{unit.cards?.length || 0} cards</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUnit(unit);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('unit', unit.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <BackButton
                  onClick={() => {
                    setActiveTab('units');
                    setSelectedUnit(null);
                  }}
                  label="Back to Units"
                />
                <h2 className="text-2xl font-bold text-copilot-text-primary">
                  Cards - {selectedUnit?.title}
                </h2>
              </div>
              <AddButton 
                onClick={() => setShowCardModal(true)}
                label="Add Card"
              />
            </div>
            <div className="space-y-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-copilot-text-primary mb-2">
                        Card {card.orderIndex}
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <strong className="text-copilot-text-secondary">Question:</strong>
                          <p className="text-copilot-text-primary">{card.question}</p>
                        </div>
                        <div>
                          <strong className="text-copilot-text-secondary">Answer:</strong>
                          <p className="text-copilot-text-primary">{card.answer}</p>
                        </div>
                        {card.exampleSentence && (
                          <div>
                            <strong className="text-copilot-text-secondary">Example:</strong>
                            <p className="text-copilot-text-primary italic">{card.exampleSentence}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete('card', card.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Modal */}
        {showStageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 max-w-4xl w-full">
              <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
                {editingStage ? 'Edit Stage' : 'Add New Stage'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Stage title"
                  value={stageForm.title}
                  onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })}
                  className="input-copilot w-full"
                />
                <textarea
                  placeholder="Description"
                  value={stageForm.description}
                  onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                  className="input-copilot w-full"
                  rows="3"
                />
                <input
                  type="number"
                  placeholder="Order index"
                  value={stageForm.orderIndex}
                  onChange={(e) => setStageForm({ ...stageForm, orderIndex: parseInt(e.target.value) })}
                  className="input-copilot w-full"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={editingStage ? handleUpdateStage : handleCreateStage} 
                  className="btn-copilot-primary flex-1"
                >
                  {editingStage ? 'Update' : 'Create'}
                </button>
                <button 
                  onClick={() => {
                    setShowStageModal(false);
                    setEditingStage(null);
                    setStageForm({ title: '', description: '', orderIndex: stages.length + 1 });
                  }} 
                  className="btn-copilot-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unit Modal */}
        {showUnitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 max-w-4xl w-full">
              <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Unit title"
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  className="input-copilot w-full"
                />
                <textarea
                  placeholder="Description"
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  className="input-copilot w-full"
                  rows="3"
                />
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={unitForm.youtubeUrl}
                  onChange={(e) => setUnitForm({ ...unitForm, youtubeUrl: e.target.value })}
                  className="input-copilot w-full"
                />
                <input
                  type="number"
                  placeholder="Video duration (seconds)"
                  value={unitForm.videoDuration}
                  onChange={(e) => setUnitForm({ ...unitForm, videoDuration: e.target.value })}
                  className="input-copilot w-full"
                />
                <input
                  type="number"
                  placeholder="Order index"
                  value={unitForm.orderIndex}
                  onChange={(e) => setUnitForm({ ...unitForm, orderIndex: parseInt(e.target.value) })}
                  className="input-copilot w-full"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={editingUnit ? handleUpdateUnit : handleCreateUnit} 
                  className="btn-copilot-primary flex-1"
                >
                  {editingUnit ? 'Update' : 'Create'}
                </button>
                <button 
                  onClick={() => {
                    setShowUnitModal(false);
                    setEditingUnit(null);
                    setUnitForm({ title: '', description: '', youtubeUrl: '', videoDuration: '', orderIndex: 1 });
                  }} 
                  className="btn-copilot-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Modal */}
        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 max-w-4xl w-full">
              <h3 className="text-xl font-bold text-copilot-text-primary mb-4">
                {editingCard ? 'Edit Card' : 'Add New Card'}
              </h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Question"
                  value={cardForm.question}
                  onChange={(e) => setCardForm({ ...cardForm, question: e.target.value })}
                  className="input-copilot w-full"
                  rows="3"
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={cardForm.answer}
                  onChange={(e) => setCardForm({ ...cardForm, answer: e.target.value })}
                  className="input-copilot w-full"
                />
                <textarea
                  placeholder="Example sentence (optional)"
                  value={cardForm.exampleSentence}
                  onChange={(e) => setCardForm({ ...cardForm, exampleSentence: e.target.value })}
                  className="input-copilot w-full"
                  rows="2"
                />
                <input
                  type="number"
                  placeholder="Order index"
                  value={cardForm.orderIndex}
                  onChange={(e) => setCardForm({ ...cardForm, orderIndex: parseInt(e.target.value) })}
                  className="input-copilot w-full"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={editingCard ? handleUpdateCard : handleCreateCard} 
                  className="btn-copilot-primary flex-1"
                >
                  {editingCard ? 'Update' : 'Create'}
                </button>
                <button 
                  onClick={() => {
                    setShowCardModal(false);
                    setEditingCard(null);
                    setCardForm({ question: '', answer: '', exampleSentence: '', orderIndex: 1 });
                  }} 
                  className="btn-copilot-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EnglishCourseAdmin;

