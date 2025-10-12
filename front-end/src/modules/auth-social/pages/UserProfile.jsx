import { useEffect, useState } from 'react';
import apiService from '../../../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user: firebaseUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    phone: '',
    preferred_language: 'pt-BR',
  });

  const [newAddress, setNewAddress] = useState({
    address_type: 'primary',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Brasil',
    is_primary: false,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!firebaseUser) return;

      try {
        setLoading(true);
        setError(null);

        // Check if user exists in backend
        const existingUser = await apiService.checkUserExists(firebaseUser.uid);
        
        if (existingUser) {
          // User exists, load their data
          setUserProfile(existingUser);
          
          // Load user addresses
          const userAddresses = await apiService.getUserAddresses(existingUser.id);
          setAddresses(userAddresses);

          // Populate form with existing data
          setFormData({
            full_name: existingUser.full_name || '',
            birth_date: existingUser.birth_date ? existingUser.birth_date.split('T')[0] : '',
            phone: existingUser.phone || '',
            preferred_language: existingUser.preferred_language || 'pt-BR',
          });
        } else {
          // User doesn't exist yet, show empty form
          setFormData({
            full_name: firebaseUser.displayName || '',
            birth_date: '',
            phone: '',
            preferred_language: 'pt-BR',
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [firebaseUser]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle address form input changes
  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save user profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      let updatedProfile;
      
      if (userProfile) {
        // User exists, update their data
        updatedProfile = await apiService.updateUser(userProfile.id, formData);
        setSuccess('Perfil atualizado com sucesso!');
      } else {
        // User doesn't exist, create new user
        updatedProfile = await apiService.createUserFromFirebase(firebaseUser, formData);
        setSuccess('Perfil criado com sucesso!');
      }
      
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const newAddressData = await apiService.createAddress(userProfile.id, newAddress);
      setAddresses(prev => [...prev, newAddressData]);
      setNewAddress({
        address_type: 'primary',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Brasil',
        is_primary: false,
      });
      setShowAddressForm(false);
      setSuccess('Endereço adicionado com sucesso!');
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Erro ao adicionar endereço');
    } finally {
      setSaving(false);
    }
  };

  // Update address
  const handleUpdateAddress = async (addressId, updatedData) => {
    if (!userProfile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedAddress = await apiService.updateAddress(userProfile.id, addressId, updatedData);
      setAddresses(prev => 
        prev.map(addr => addr.id === addressId ? updatedAddress : addr)
      );
      setSuccess('Endereço atualizado com sucesso!');
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Erro ao atualizar endereço');
    } finally {
      setSaving(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!userProfile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await apiService.deleteAddress(userProfile.id, addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      setSuccess('Endereço removido com sucesso!');
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Erro ao remover endereço');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-copilot-bg-primary">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            {userProfile ? 'Meu Perfil' : 'Complete seu Perfil'}
          </h1>
          <p className="text-copilot-text-secondary">
            {userProfile 
              ? 'Gerencie suas informações pessoais e endereços'
              : 'Adicione suas informações pessoais e endereços para começar'
            }
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-copilot">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-copilot">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information Form */}
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6">
            <h2 className="text-xl font-semibold text-copilot-text-primary mb-6">
              Informações Pessoais
            </h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+55 (11) 99999-9999"
                  className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                  Idioma Preferido
                </label>
                <select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-copilot-accent-primary text-white py-2 px-4 rounded-copilot font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving 
                  ? (userProfile ? 'Salvando...' : 'Criando...') 
                  : (userProfile ? 'Salvar Perfil' : 'Criar Perfil')
                }
              </button>
            </form>
          </div>

          {/* Addresses Section */}
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-copilot-text-primary">
                Endereços
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="bg-copilot-accent-primary text-white px-4 py-2 rounded-copilot text-sm font-medium hover:bg-opacity-90 transition-all duration-200"
              >
                {showAddressForm ? 'Cancelar' : 'Adicionar Endereço'}
              </button>
            </div>

            {/* Address List */}
            <div className="space-y-4 mb-6">
              {addresses.map((address) => (
                <div key={address.id} className="border border-copilot-border-default rounded-copilot p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-copilot-text-primary">
                          {address.address_type === 'primary' ? 'Principal' : 
                           address.address_type === 'billing' ? 'Cobrança' :
                           address.address_type === 'shipping' ? 'Entrega' : 'Outro'}
                        </span>
                        {address.is_primary && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-copilot-text-secondary">
                        {address.street && `${address.street}, `}
                        {address.number && `${address.number}, `}
                        {address.neighborhood && `${address.neighborhood}, `}
                        {address.city && `${address.city} - ${address.state}, `}
                        {address.postal_code && `${address.postal_code}, `}
                        {address.country}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateAddress(address.id, { is_primary: !address.is_primary })}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        {address.is_primary ? 'Remover Principal' : 'Tornar Principal'}
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Tipo
                    </label>
                    <select
                      name="address_type"
                      value={newAddress.address_type}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                    >
                      <option value="primary">Principal</option>
                      <option value="billing">Cobrança</option>
                      <option value="shipping">Entrega</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_primary"
                        checked={newAddress.is_primary}
                        onChange={handleAddressInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-copilot-text-primary">Endereço Principal</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressInputChange}
                    required
                    className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={newAddress.number}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="complement"
                      value={newAddress.complement}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={newAddress.neighborhood}
                    onChange={handleAddressInputChange}
                    className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={newAddress.postal_code}
                      onChange={handleAddressInputChange}
                      required
                      className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                    País *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleAddressInputChange}
                    required
                    className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-copilot-accent-primary text-white py-2 px-4 rounded-copilot font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? 'Adicionando...' : 'Adicionar Endereço'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-copilot-border-default text-copilot-text-primary rounded-copilot hover:bg-copilot-bg-primary transition-all duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
