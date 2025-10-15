import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user: firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Unified Form state
  const [formData, setFormData] = useState({
    // Personal info
    full_name: '',
    birth_date: '',
    phone: '',
    preferred_language: 'pt-BR',
    // Address info
    address_type: 'primary',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Brasil',
    is_primary: true,
  });

  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddress, setEditAddress] = useState(null);

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

          // Populate form with existing data (including first address if exists)
          const primaryAddress = userAddresses.find(addr => addr.is_primary) || userAddresses[0] || {};

          setFormData({
            full_name: existingUser.full_name || '',
            birth_date: existingUser.birth_date ? existingUser.birth_date.split('T')[0] : '',
            phone: existingUser.phone || '',
            preferred_language: existingUser.preferred_language || 'pt-BR',
            address_type: primaryAddress.address_type || 'primary',
            street: primaryAddress.street || '',
            number: primaryAddress.number || '',
            complement: primaryAddress.complement || '',
            neighborhood: primaryAddress.neighborhood || '',
            city: primaryAddress.city || '',
            state: primaryAddress.state || '',
            postal_code: primaryAddress.postal_code || '',
            country: primaryAddress.country || 'Brasil',
            is_primary: primaryAddress.is_primary || true,
          });
        } else {
          // User doesn't exist yet, show empty form
          setFormData({
            full_name: firebaseUser.displayName || '',
            birth_date: '',
            phone: '',
            preferred_language: 'pt-BR',
            address_type: 'primary',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'Brasil',
            is_primary: true,
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle edit address form input changes
  const handleEditAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Start editing an address
  const handleStartEditAddress = (address) => {
    setEditingAddressId(address.id);
    setEditAddress({ ...address });
  };

  // Cancel editing an address
  const handleCancelEditAddress = () => {
    setEditingAddressId(null);
    setEditAddress(null);
  };

  // Save user profile and address together
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Separate user data and address data
      const userData = {
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        phone: formData.phone,
        preferred_language: formData.preferred_language,
      };

      const addressData = {
        address_type: formData.address_type,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        is_primary: formData.is_primary,
      };

      let updatedProfile;

      if (userProfile) {
        // User exists, update their data
        updatedProfile = await apiService.updateUser(userProfile.id, userData);

        // Update or create address
        const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
        if (primaryAddress) {
          // Update existing address
          const updatedAddress = await apiService.updateAddress(userProfile.id, primaryAddress.id, addressData);
          setAddresses(prev => prev.map(addr => addr.id === primaryAddress.id ? updatedAddress : addr));
        } else {
          // Create new address
          const newAddress = await apiService.createAddress(userProfile.id, addressData);
          setAddresses(prev => [...prev, newAddress]);
        }

        setSuccess('Perfil e endereço atualizados com sucesso!');
      } else {
        // User doesn't exist, create new user
        updatedProfile = await apiService.createUserFromFirebase(firebaseUser, userData);

        // Create address for new user
        const newAddress = await apiService.createAddress(updatedProfile.id, addressData);
        setAddresses([newAddress]);

        setSuccess('Perfil e endereço criados com sucesso!');
      }

      setUserProfile(updatedProfile);

      // Navigate to home page after successful save
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erro ao salvar perfil e endereço');
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

  // Save edited address
  const handleSaveEditAddress = async (e) => {
    e.preventDefault();
    if (!userProfile || !editAddress) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedAddress = await apiService.updateAddress(userProfile.id, editAddress.id, editAddress);
      setAddresses(prev =>
        prev.map(addr => addr.id === editAddress.id ? updatedAddress : addr)
      );
      setSuccess('Endereço atualizado com sucesso!');
      setEditingAddressId(null);
      setEditAddress(null);
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
      <div className="bg-copilot-bg-primary flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/home')}
            className="btn-copilot-secondary flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
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
          </div>
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

        {/* Unified Form Card: Personal Information and Address */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-copilot-text-primary mb-6">
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-copilot-border-default"></div>

            {/* Address Section */}
            <div>
              <h2 className="text-xl font-semibold text-copilot-text-primary mb-6">
                Endereço
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Tipo
                    </label>
                    <select
                      name="address_type"
                      value={formData.address_type}
                      onChange={handleInputChange}
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
                        checked={formData.is_primary}
                        onChange={handleInputChange}
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
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
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
                      value={formData.complement}
                      onChange={handleInputChange}
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
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
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
                      value={formData.state}
                      onChange={handleInputChange}
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
                      value={formData.postal_code}
                      onChange={handleInputChange}
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
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-copilot-accent-primary text-white py-3 px-4 rounded-copilot font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving
                ? (userProfile ? 'Salvando...' : 'Criando...')
                : 'Salvar'
              }
            </button>
          </form>

          {/* Divider before additional addresses */}
          {addresses.length > 0 && (
            <div className="border-t border-copilot-border-default my-8"></div>
          )}

          {/* Additional Addresses List (for multiple addresses) */}
          {userProfile && addresses.length > 1 && (
            <div>
              <h2 className="text-xl font-semibold text-copilot-text-primary mb-6">
                Endereços Adicionais
              </h2>
              <div className="space-y-4">
                {addresses.slice(1).map((address) => (
                  <div key={address.id} className="border border-copilot-border-default rounded-copilot p-4">
                    {editingAddressId === address.id ? (
                      <form onSubmit={handleSaveEditAddress} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                              Tipo
                            </label>
                            <select
                              name="address_type"
                              value={editAddress.address_type}
                              onChange={handleEditAddressInputChange}
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
                                checked={editAddress.is_primary}
                                onChange={handleEditAddressInputChange}
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
                            value={editAddress.street}
                            onChange={handleEditAddressInputChange}
                            required
                            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                              Número
                            </label>
                            <input
                              type="text"
                              name="number"
                              value={editAddress.number || ''}
                              onChange={handleEditAddressInputChange}
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
                              value={editAddress.complement || ''}
                              onChange={handleEditAddressInputChange}
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
                            value={editAddress.neighborhood || ''}
                            onChange={handleEditAddressInputChange}
                            className="w-full px-3 py-2 border border-copilot-border-default rounded-copilot focus:outline-none focus:ring-2 focus:ring-copilot-accent-primary focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-copilot-text-primary mb-2">
                              Cidade
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={editAddress.city || ''}
                              onChange={handleEditAddressInputChange}
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
                              value={editAddress.state || ''}
                              onChange={handleEditAddressInputChange}
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
                              value={editAddress.postal_code}
                              onChange={handleEditAddressInputChange}
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
                            value={editAddress.country}
                            onChange={handleEditAddressInputChange}
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
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditAddress}
                            className="px-4 py-2 border border-copilot-border-default text-copilot-text-primary rounded-copilot hover:bg-copilot-bg-primary transition-all duration-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
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
                            onClick={() => handleStartEditAddress(address)}
                            disabled={!userProfile}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              !userProfile
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleUpdateAddress(address.id, { is_primary: !address.is_primary })}
                            disabled={!userProfile}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              !userProfile
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {address.is_primary ? 'Remover Principal' : 'Tornar Principal'}
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={!userProfile}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              !userProfile
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
