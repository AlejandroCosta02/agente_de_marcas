'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaGlobe, FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import AddLeadModal from './AddLeadModal';
import { Lead, LeadSubmissionData, LEAD_ESTADOS, LeadEstado, CONTACT_METHODS } from '@/types/lead';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper for fetch with timeout
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export default function LeadsClient() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [openContactDropdown, setOpenContactDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const fetchLeads = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log('fetchLeads: Starting to fetch leads');
      setLoading(true);
      const response = await fetch('/api/leads');
      
      console.log('fetchLeads: Response status:', response.status);
      
      if (response.status === 401) {
        window.location.href = '/?error=Unauthorized';
        return;
      }
      
      if (!response.ok) {
        throw new Error('Error fetching leads');
      }
      
      const data = await response.json();
      console.log('fetchLeads: Data received:', data);
      console.log('fetchLeads: Data length:', data.length);
      setLeads(data);
      console.log('fetchLeads: Leads state updated');
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Error al cargar los leads');
    } finally {
      console.log('fetchLeads: Setting loading to false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSubmit = async (data: LeadSubmissionData) => {
    try {
      // Validate nombre is required
      if (!data.nombre || data.nombre.trim() === '') {
        toast.error('El nombre es obligatorio');
        return;
      }

      // Process website field - auto-prepend https:// if missing
      const processedData = { ...data };
      if (processedData.website && processedData.website.trim() !== '') {
        const website = processedData.website.trim();
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
          processedData.website = `https://${website}`;
        }
      }

      const method = selectedLead ? 'PUT' : 'POST';
      const url = '/api/leads';
      const body = selectedLead ? { ...processedData, id: selectedLead.id } : processedData;

      console.log('Submitting lead data:', body);

      const response = await fetchWithTimeout(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = 'Error al guardar el lead';
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorData?.details || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          try {
            const textError = await response.text();
            if (textError) errorMessage = textError;
          } catch {
            // If all else fails, use default message
          }
        }
        throw new Error(errorMessage);
      }

      await response.json();
      toast.success(selectedLead ? 'Lead actualizado exitosamente' : 'Lead agregado exitosamente');
      setIsModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este lead?')) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: lead.id }),
      });

      if (!response.ok) throw new Error('Error al eliminar lead');

      toast.success('Lead eliminado exitosamente');
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleToggleContacted = async (lead: Lead) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lead.id,
          contacted: !lead.contacted,
          nombre: lead.nombre,
          direccion: lead.direccion,
          website: lead.website,
          socialMedia: lead.socialMedia,
          whatsapp: lead.whatsapp,
          email: lead.email,
          estado: lead.estado,
          meetingSet: lead.meetingSet
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar lead');

      toast.success('Estado de contacto actualizado');
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleToggleMeetingSet = async (lead: Lead) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lead.id,
          meetingSet: !lead.meetingSet,
          nombre: lead.nombre,
          direccion: lead.direccion,
          website: lead.website,
          socialMedia: lead.socialMedia,
          whatsapp: lead.whatsapp,
          email: lead.email,
          estado: lead.estado,
          contacted: lead.contacted
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar lead');

      toast.success('Estado de reunión actualizado');
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    }
  };

  const handleEstadoChange = async (lead: Lead, newEstado: LeadEstado) => {
    console.log('handleEstadoChange called with:', { leadId: lead.id, newEstado, lead });
    
    // If the new estado is "nuevo" (nuevo cliente confirmado), show confirmation dialog
    if (newEstado === 'nuevo') {
      console.log('Nuevo estado detected, showing confirmation dialog');
      const confirmed = window.confirm(
        '¿Estás seguro de que deseas confirmar este cliente?\n\n' +
        'Esta acción moverá el lead a la tabla principal de marcas en el dashboard.\n' +
        'El lead será eliminado de la lista de leads y aparecerá como una nueva marca registrada.'
      );
      
      if (!confirmed) {
        console.log('User cancelled the confirmation');
        return; // User cancelled, don't proceed
      }
      
      console.log('User confirmed, proceeding with marca creation');
      try {
        // Create the marca with all required default values
        const now = new Date();
        const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const marcaData = {
          marca: lead.nombre,
          renovar: oneYearFromNow,
          vencimiento: oneYearFromNow,
          djumt: oneYearFromNow,
          titulares: [
            {
              id: `titular-${Date.now()}`,
              fullName: lead.nombre,
              email: lead.email || 'pendiente@email.com',
              phone: lead.whatsapp || ''
            }
          ],
          anotacion: [`Lead convertido a cliente el ${now.toLocaleDateString()}`],
          oposicion: [],
          clases: [1],
          tipoMarca: 'denominativa',
          classDetails: {
            "1": {
              "acta": "Pendiente",
              "resolucion": "Pendiente"
            }
          }
        };

        console.log('Creating marca from lead...', marcaData);
        const marcaResponse = await fetchWithTimeout('/api/marcas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(marcaData),
        });
        console.log('Marca response received');

        if (!marcaResponse.ok) {
          let errorData: { message?: string } = {};
          try { errorData = await marcaResponse.json(); } catch {}
          throw new Error(errorData.message || 'Error al crear la marca');
        }

        // Delete the lead from the leads table
        console.log('Deleting lead after marca creation...');
        const deleteResponse = await fetchWithTimeout('/api/leads', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: lead.id }),
        });
        console.log('Lead deleted response received');

        if (!deleteResponse.ok) {
          throw new Error('Error al eliminar el lead');
        }

        toast.success('¡Cliente confirmado! El lead ha sido movido a la tabla de marcas.');
        fetchLeads();
      } catch (error) {
        console.error('Error confirming client:', error);
        toast.error(error instanceof Error ? error.message : 'Error al confirmar el cliente');
      }
    } else {
      // For other estados, proceed with normal update
      try {
        const response = await fetchWithTimeout('/api/leads', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: lead.id,
            estado: newEstado,
            nombre: lead.nombre,
            direccion: lead.direccion,
            website: lead.website,
            socialMedia: lead.socialMedia,
            whatsapp: lead.whatsapp,
            email: lead.email,
            contacted: lead.contacted,
            meetingSet: lead.meetingSet
          }),
        });

        if (!response.ok) throw new Error('Error al actualizar lead');

        toast.success('Estado actualizado');
        fetchLeads();
      } catch (error) {
        console.error('Error updating lead:', error);
        toast.error('Error al actualizar el lead');
      }
    }
  };

  const handleUpdateContactMethods = async (lead: Lead, newContactMethods: string[]) => {
    try {
      const response = await fetchWithTimeout('/api/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lead.id,
          contactMethods: newContactMethods,
          nombre: lead.nombre,
          direccion: lead.direccion,
          website: lead.website,
          socialMedia: lead.socialMedia,
          whatsapp: lead.whatsapp,
          email: lead.email,
          estado: lead.estado,
          contacted: lead.contacted,
          meetingSet: lead.meetingSet
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar métodos de contacto');

      toast.success('Métodos de contacto actualizados');
      fetchLeads();
    } catch (error) {
      console.error('Error updating contact methods:', error);
      toast.error('Error al actualizar los métodos de contacto');
    }
  };

  const getSocialMediaIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram')) return <FaInstagram className="text-pink-500" />;
    if (lowerUrl.includes('facebook')) return <FaFacebook className="text-blue-600" />;
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return <FaTwitter className="text-blue-400" />;
    return <FaGlobe className="text-gray-500" />;
  };

  const openLink = (url: string, type: string) => {
    if (!url) return;
    
    let finalUrl = url;
    if (type === 'whatsapp' && !url.startsWith('http')) {
      finalUrl = `https://wa.me/${url.replace(/\D/g, '')}`;
    } else if (type === 'email' && !url.startsWith('mailto:')) {
      finalUrl = `mailto:${url}`;
    } else if (type === 'website' && !url.startsWith('http')) {
      finalUrl = `https://${url}`;
    }
    
    window.open(finalUrl, '_blank');
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // When opening dropdown, calculate position
  const handleOpenDropdown = (leadId: string) => {
    if (openContactDropdown === leadId) {
      setOpenContactDropdown(null);
      setDropdownPosition(null);
    } else {
      const btn = dropdownButtonRefs.current[leadId];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
      setOpenContactDropdown(leadId);
    }
  };

  // Handler for updating futureContactDate
  const handleUpdateFutureContactDate = async (lead: Lead, date: Date | null) => {
    try {
      const response = await fetchWithTimeout('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          futureContactDate: date ? date.toISOString() : null,
          nombre: lead.nombre,
          direccion: lead.direccion,
          website: lead.website,
          socialMedia: lead.socialMedia,
          whatsapp: lead.whatsapp,
          email: lead.email,
          estado: lead.estado,
          contacted: lead.contacted,
          meetingSet: lead.meetingSet,
          contactMethods: lead.contactMethods || []
        })
      });
      if (!response.ok) throw new Error('Error al actualizar la fecha de contacto');
      toast.success('Fecha de contacto actualizada');
      fetchLeads();
    } catch (error) {
      console.error('Error updating future contact date:', error);
      toast.error('Error al actualizar la fecha de contacto');
    }
  };

  console.log('Component render: loading =', loading, 'leads.length =', leads.length);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona tus leads de manera eficiente
          </p>
        </div>

        {/* Add Lead Button */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            Agregar Lead
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-600 bg-opacity-30 rounded-full p-3">
                  <FaGlobe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white uppercase">Total Leads</p>
                <p className="text-3xl font-bold text-white">{leads.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-600 bg-opacity-30 rounded-full p-3">
                  <FaCheck className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white uppercase">Contactados</p>
                <p className="text-3xl font-bold text-white">{leads.filter(l => l.contacted).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-purple-600 bg-opacity-30 rounded-full p-3">
                  <FaCalendarAlt className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white uppercase">Reuniones</p>
                <p className="text-3xl font-bold text-white">{leads.filter(l => l.meetingSet).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-600 bg-opacity-30 rounded-full p-3">
                  <FaTimes className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white uppercase">Sin Contactar</p>
                <p className="text-3xl font-bold text-white">{leads.filter(l => !l.contacted).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <FaGlobe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay leads</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer lead.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Métodos de Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {truncateText(lead.nombre, 30)}
                        </div>
                        {lead.direccion && (
                          <div className="text-sm text-gray-600 mt-1">
                            {truncateText(lead.direccion, 40)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {lead.website && (
                            <button
                              onClick={() => openLink(lead.website!, 'website')}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50 cursor-pointer"
                              title="Abrir website"
                            >
                              <FaGlobe className="h-4 w-4" />
                            </button>
                          )}
                          {lead.socialMedia && (
                            <button
                              onClick={() => openLink(lead.socialMedia!, 'social')}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50 cursor-pointer"
                              title="Abrir red social"
                            >
                              {getSocialMediaIcon(lead.socialMedia)}
                            </button>
                          )}
                          {lead.whatsapp && (
                            <button
                              onClick={() => openLink(lead.whatsapp!, 'whatsapp')}
                              className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50 cursor-pointer"
                              title="Abrir WhatsApp"
                            >
                              <FaWhatsapp className="h-4 w-4" />
                            </button>
                          )}
                          {lead.email && (
                            <button
                              onClick={() => openLink(lead.email!, 'email')}
                              className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50 cursor-pointer"
                              title="Enviar email"
                            >
                              <FaEnvelope className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            value={lead.estado}
                            onChange={(e) => handleEstadoChange(lead, e.target.value as LeadEstado)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 shadow-sm cursor-pointer"
                          >
                            {Object.entries(LEAD_ESTADOS).map(([key, { emoji, label }]) => (
                              <option key={key} value={key}>
                                {emoji} {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            ref={el => { dropdownButtonRefs.current[lead.id] = el; }}
                            onClick={() => handleOpenDropdown(lead.id)}
                            className="flex items-center justify-between w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900 shadow-sm cursor-pointer"
                          >
                            <span>
                              {lead.contactMethods && lead.contactMethods.length > 0 
                                ? `${lead.contactMethods.length} método${lead.contactMethods.length > 1 ? 's' : ''}`
                                : 'Sin contactar'
                              }
                            </span>
                            <FaChevronDown className={`h-3 w-3 transition-transform ${openContactDropdown === lead.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {openContactDropdown === lead.id && dropdownPosition && createPortal(
                            <div
                              className="z-50 w-64 bg-white border border-gray-300 rounded-lg shadow-lg"
                              style={{ position: 'absolute', top: dropdownPosition.top, left: dropdownPosition.left }}
                            >
                              <div className="p-3">
                                <div className="text-xs font-medium text-gray-700 mb-2">Métodos de contacto:</div>
                                {Object.entries(CONTACT_METHODS).map(([key, { label, emoji }]) => (
                                  <label key={key} className="flex items-center space-x-2 py-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={lead.contactMethods?.includes(key) || false}
                                      onChange={(e) => {
                                        const currentMethods = lead.contactMethods || [];
                                        const newMethods = e.target.checked
                                          ? [...currentMethods, key]
                                          : currentMethods.filter(m => m !== key);
                                        
                                        // Update the lead with new contact methods
                                        handleUpdateContactMethods(lead, newMethods);
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                      {emoji} {label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(lead)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                            title="Editar lead"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                            title="Eliminar lead"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contactar a futuro Table */}
        {(() => {
          const enEsperaLeads = leads.filter(l => l.estado === 'en_espera');
          console.log('En espera leads:', enEsperaLeads);
          console.log('Total leads:', leads.length);
          console.log('Should show table:', enEsperaLeads.length > 0);
          
          return enEsperaLeads.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contactar a futuro</h2>
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contacto</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha de contacto</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {enEsperaLeads
                        .sort((a, b) => {
                          if (!a.futureContactDate) return 1;
                          if (!b.futureContactDate) return -1;
                          return new Date(a.futureContactDate).getTime() - new Date(b.futureContactDate).getTime();
                        })
                        .map((lead) => (
                          <tr key={lead.id} className="hover:bg-yellow-50/50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">{truncateText(lead.nombre, 30)}</div>
                              {lead.direccion && (
                                <div className="text-sm text-gray-600 mt-1">{truncateText(lead.direccion, 40)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                {lead.website && (
                                  <button onClick={() => openLink(lead.website!, 'website')} className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50 cursor-pointer" title="Abrir website"><FaGlobe className="h-4 w-4" /></button>
                                )}
                                {lead.socialMedia && (
                                  <button onClick={() => openLink(lead.socialMedia!, 'social')} className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50 cursor-pointer" title="Abrir red social">{getSocialMediaIcon(lead.socialMedia)}</button>
                                )}
                                {lead.whatsapp && (
                                  <button onClick={() => openLink(lead.whatsapp!, 'whatsapp')} className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50 cursor-pointer" title="Abrir WhatsApp"><FaWhatsapp className="h-4 w-4" /></button>
                                )}
                                {lead.email && (
                                  <button onClick={() => openLink(lead.email!, 'email')} className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50 cursor-pointer" title="Enviar email"><FaEnvelope className="h-4 w-4" /></button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <DatePicker
                                selected={lead.futureContactDate ? new Date(lead.futureContactDate) : null}
                                onChange={(date: Date | null) => handleUpdateFutureContactDate(lead, date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Seleccionar fecha"
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-black"
                                minDate={new Date()}
                                isClearable
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button onClick={() => handleEdit(lead)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm cursor-pointer" title="Editar lead"><FaEdit className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(lead)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 shadow-sm cursor-pointer" title="Eliminar lead"><FaTrash className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null;
        })()}

      {/* Add/Edit Lead Modal */}
      </div>
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedLead ? {
          nombre: selectedLead.nombre,
          direccion: selectedLead.direccion || undefined,
          website: selectedLead.website || undefined,
          socialMedia: selectedLead.socialMedia || undefined,
          whatsapp: selectedLead.whatsapp || undefined,
          email: selectedLead.email || undefined
        } : undefined}
      />
    </div>
  );
}