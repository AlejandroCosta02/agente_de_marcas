'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import AddMarcaModal from '../AddMarcaModal';
import { Marca, MarcaSubmissionData, Oposicion, Anotacion } from '@/types/marca';
import OposicionModal from '@/components/OposicionModal';
import UploadFileModal from '@/components/modals/UploadFileModal';
import { FaPlus, FaDownload, FaCog, FaLock, FaFileAlt } from 'react-icons/fa';
import ViewTextModal from '../ViewTextModal';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AnotacionModal from '../AnotacionModal';
import SubscriptionStatus from "@/components/SubscriptionStatus";
import UpgradeModal from "@/components/UpgradeModal";
import MarcaDetailPanel from '../MarcaDetailPanel';
import WelcomeModal from '../WelcomeModal';
import { useSession } from 'next-auth/react';
import DateFilterModal, { DateType, TimeRange } from './DateFilterModal';
import GrowthBanner from '../GrowthBanner';


interface ViewTextModalState {
  isOpen: boolean;
  title: string;
  content: string;
}

// BoletinScanModal component removed as it's not being used

export default function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [oposicionModalOpen, setOposicionModalOpen] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedMarcaForFiles, setSelectedMarcaForFiles] = useState<string | null>(null);
  const [anotacionModalOpen, setAnotacionModalOpen] = useState(false);
  const [selectedMarcaForAnotacion, setSelectedMarcaForAnotacion] = useState<Marca | null>(null);
  const [selectedMarcaForOposicion, setSelectedMarcaForOposicion] = useState<Marca | null>(null);
  const [selectedOposicion, setSelectedOposicion] = useState<{ marcaId: string; index: number; oposicion: Oposicion } | null>(null);
  const [viewTextModal, setViewTextModal] = useState<ViewTextModalState>({ isOpen: false, title: '', content: '' });
  const [needsMigration, setNeedsMigration] = useState(false);
  const router = useRouter();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedMarcaForDetail, setSelectedMarcaForDetail] = useState<Marca | null>(null);
  const [showBlur, setShowBlur] = useState(false);
  const [boletinLoading, setBoletinLoading] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const { data: session } = useSession();

  // Date filtering state
  const [dateFilterModalOpen, setDateFilterModalOpen] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<DateType>('fechaDeRenovacion');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30');

  // Informe modal state
  const [informeModalOpen, setInformeModalOpen] = useState(false);
  const [informeLoading, setInformeLoading] = useState(false);
  const [selectedMarcaForInforme, setSelectedMarcaForInforme] = useState<string>('');
  const [includeAnotaciones, setIncludeAnotaciones] = useState(false);
  const [includeOposiciones, setIncludeOposiciones] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState<{
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    cuit?: string;
    matricula?: string;
  } | null>(null);

  // Subscription state
  const [isPremium, setIsPremium] = useState(false);

  // console.log('🎯 DashboardClient component rendering, current marcas:', marcas.length);
  
  const totalMarcas = marcas.length;
  const marcasConOposiciones = marcas.filter(marca => 
    Array.isArray(marca.oposicion) && marca.oposicion.length > 0
  ).length;

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.email) return;
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setIsPremium(['essential', 'pro', 'master'].includes(data.subscription?.tier));
        }
      } catch {
        setIsPremium(false);
      }
    };
    fetchSubscription();
  }, [session?.user?.email]);

  const fetchMarcas = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // console.log('🔄 Fetching marcas...');
      const response = await fetch('/api/marcas');
      // console.log('📡 Response status:', response.status);
      // console.log('📡 Response ok:', response.ok);
      
      if (response.status === 401) {
        // Unauthorized, redirect to login
        window.location.href = '/?error=Unauthorized';
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Response not ok:', errorData);
        if (errorData?.details?.includes('column "tipo_marca" does not exist')) {
          setNeedsMigration(true);
          return;
        }
        throw new Error(errorData?.message || 'Error fetching data');
      }
      
      const data = await response.json();
      // console.log('📦 Received marcas data:', {
      //   count: data.length,
      //   isArray: Array.isArray(data),
      //   dataType: typeof data,
      //   marcas: data.map((m: { id: string; marca: string; renovar: string; vencimiento: string; djumt: string }) => ({
      //     id: m.id,
      //     marca: m.marca,
      //     renovar: m.renovar,
      //     vencimiento: m.vencimiento,
      //     djumt: m.djumt
      //   }))
      // });
      
      // console.log('🔄 About to update marcas state with:', data.length, 'marcas');
      setMarcas(data);
      setNeedsMigration(false);
      // console.log('✅ Marcas state update called');
    } catch (error: unknown) {
      console.error('❌ Error fetching marcas:', error);
      if (error instanceof Error) {
        if (error.message.includes('column "tipo_marca" does not exist')) {
          setNeedsMigration(true);
          return;
        }
        toast.error(error.message);
      } else {
        toast.error('An error occurred while fetching the data');
      }
    }
  }, []);

  useEffect(() => {
    // console.log('🚀 Dashboard component mounted, fetching marcas...');
    fetchMarcas();
  }, [fetchMarcas]);

  // Debug marcas state changes
  useEffect(() => {
    // console.log('📊 Marcas state updated:', {
    //   count: marcas.length,
    //   marcas: marcas.map(m => ({ id: m.id, marca: m.marca }))
    // });
  }, [marcas]);

  // Check if user should see welcome message
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/user/welcome-seen');
        if (response.ok) {
          const data = await response.json();
          if (!data.welcome_seen) {
            setWelcomeModalOpen(true);
          }
        }
      } catch (error) {
        console.error('Error checking welcome status:', error);
      }
    };

    checkWelcomeStatus();
  }, [session?.user?.id]);

  const handleWelcomeClose = async () => {
    try {
      await fetch('/api/user/welcome-seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setWelcomeModalOpen(false);
    } catch (error) {
      console.error('Error marking welcome as seen:', error);
      setWelcomeModalOpen(false);
    }
  };

  useEffect(() => {
    if (detailPanelOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Clean up in case of unmount
    return () => document.body.classList.remove('overflow-hidden');
  }, [detailPanelOpen]);

  useEffect(() => {
    if (detailPanelOpen && selectedMarcaForDetail) {
      const latest = marcas.find(m => m.id === selectedMarcaForDetail.id);
      if (latest) {
        setSelectedMarcaForDetail(latest);
      }
    }
  }, [marcas, detailPanelOpen, selectedMarcaForDetail]);

  const handleEdit = (marca: Marca) => {
    // console.log('Editing marca:', marca);
    setSelectedMarca({
      ...marca,
      // Ensure titulares is properly structured for editing
      titulares: marca.titulares && Array.isArray(marca.titulares) && marca.titulares.length > 0
        ? marca.titulares.map(t => ({
            id: t.id || `${t.email || t.fullName || 'titular'}-${marca.id}`,
            fullName: t.fullName || '',
            email: t.email || '',
            phone: t.phone || ''
          }))
        : [{
            id: `${marca.titular?.email || marca.titular?.fullName || 'default'}-${marca.id}`,
            fullName: marca.titular?.fullName || '',
            email: marca.titular?.email || '',
            phone: marca.titular?.phone || ''
          }]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: MarcaSubmissionData) => {
    try {
      const method = selectedMarca ? 'PUT' : 'POST';
      const url = selectedMarca 
        ? `/api/marcas?id=${selectedMarca.id}`
        : '/api/marcas';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || await response.text() || 'Error al guardar la marca';
        throw new Error(errorMessage);
      }

      const updatedMarca = await response.json();
      toast.success(selectedMarca ? 'Marca actualizada exitosamente' : 'Marca agregada exitosamente');
      setIsModalOpen(false);
      setSelectedMarca(null);
      fetchMarcas(); // Refresh the table

      // If the panel is open and showing this marca, update it
      if (detailPanelOpen && selectedMarcaForDetail && updatedMarca.id === selectedMarcaForDetail.id) {
        setSelectedMarcaForDetail({ ...selectedMarcaForDetail, ...updatedMarca });
      }
    } catch (error) {
      console.error('Error saving marca:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la marca');
    }
  };

  const calculateProximosVencer = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for consistent comparison
    const daysFromNow = parseInt(selectedTimeRange);
    const futureDate = new Date(today.getTime() + (daysFromNow * 24 * 60 * 60 * 1000));
    
    // console.log('🔍 Date filtering debug:', {
    //   totalMarcas: marcas.length,
    //   selectedDateType,
    //   selectedTimeRange,
    //   today: today.toISOString(),
    //   futureDate: futureDate.toISOString(),
    //   marcas: marcas.map(m => ({
    //     id: m.id,
    //     marca: m.marca,
    //     renovar: m.renovar,
    //     vencimiento: m.vencimiento,
    //     djumt: m.djumt
    //   }))
    // });
    
    const filteredCount = marcas.filter(marca => {
      let dateToCheck: string;
      
      switch (selectedDateType) {
        case 'fechaDeRenovacion':
          dateToCheck = marca.renovar;
          break;
        case 'fechaDeVencimiento':
          dateToCheck = marca.vencimiento;
          break;
        case 'DJUMT':
          dateToCheck = marca.djumt;
          break;
        default:
          dateToCheck = marca.renovar;
      }
      
      // Convert DD/MM/YYYY to Date object
      const checkDate = parseDateString(dateToCheck);
      if (!checkDate) {
        // console.log('❌ Invalid date for marca:', marca.id, dateToCheck);
        return false;
      }
      
      // Set time to start of day for consistent comparison
      const normalizedCheckDate = new Date(checkDate);
      normalizedCheckDate.setHours(0, 0, 0, 0);
      
      const isInRange = normalizedCheckDate <= futureDate && normalizedCheckDate >= today;
      // console.log(`📅 Marca ${marca.id} (${marca.marca}): ${dateToCheck} -> ${normalizedCheckDate.toISOString()} -> ${isInRange ? '✅ IN RANGE' : '❌ OUT OF RANGE'}`);
      
      return isInRange;
    }).length;
    
    // console.log(`🎯 Filtered count: ${filteredCount}`);
    return filteredCount;
  };

  const getCardTitle = () => {
    switch (selectedDateType) {
      case 'fechaDeRenovacion':
        return 'Próximo a Renovar';
      case 'fechaDeVencimiento':
        return 'Próximo a Vencer';
      case 'DJUMT':
        return 'Próximo a DJUMT';
      default:
        return 'Próximo a Renovar';
    }
  };

  const getFilteredMarcas = () => {
    // console.log('🔍 Table sorting debug:', {
    //   totalMarcas: marcas.length,
    //   selectedDateType,
    //   marcas: marcas.map(m => ({
    //     id: m.id,
    //     marca: m.marca,
    //     renovar: m.renovar,
    //     vencimiento: m.vencimiento,
    //     djumt: m.djumt
    //   }))
    // });
    
    // Return ALL marcas, sorted by the selected date type (closest to farthest)
    const sortedMarcas = [...marcas].sort((a, b) => {
      let dateA: string;
      let dateB: string;
      
      switch (selectedDateType) {
        case 'fechaDeRenovacion':
          dateA = a.renovar;
          dateB = b.renovar;
          break;
        case 'fechaDeVencimiento':
          dateA = a.vencimiento;
          dateB = b.vencimiento;
          break;
        case 'DJUMT':
          dateA = a.djumt;
          dateB = b.djumt;
          break;
        default:
          dateA = a.renovar;
          dateB = b.renovar;
      }
      
      // console.log(`🔍 Comparing dates for sorting: ${a.marca} (${dateA}) vs ${b.marca} (${dateB})`);
      
      const parsedDateA = parseDateString(dateA);
      const parsedDateB = parseDateString(dateB);
      
      // console.log(`📅 Parsed dates: ${a.marca} -> ${parsedDateA?.toISOString()}, ${b.marca} -> ${parsedDateB?.toISOString()}`);
      
      if (!parsedDateA && !parsedDateB) return 0;
      if (!parsedDateA) return 1;
      if (!parsedDateB) return -1;
      
      const comparison = parsedDateA.getTime() - parsedDateB.getTime();
      // console.log(`📊 Sort comparison: ${a.marca} vs ${b.marca} = ${comparison}`);
      return comparison;
    });
    
    // console.log(`🎯 Table sorted marcas: ${sortedMarcas.length} (all marcas, sorted by ${selectedDateType})`);
    // console.log('📋 Final sorted order:', sortedMarcas.map(m => ({ marca: m.marca, date: m[selectedDateType as keyof Marca] })));
    return sortedMarcas;
  };

  // Helper function to parse DD/MM/YYYY format to Date object
  const parseDateString = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // console.log('🔍 Parsing date:', dateString);
    
    // If it's already in ISO format (full ISO string with time), parse directly
    if (dateString.includes('T') && dateString.includes('Z')) {
      const date = new Date(dateString);
      const isValid = !isNaN(date.getTime());
      // console.log(`📅 Full ISO date ${dateString} -> ${date.toISOString()} (valid: ${isValid})`);
      return isValid ? date : null;
    }
    
    // If it's in ISO date format (YYYY-MM-DD), parse directly
    if (dateString.includes('-') && dateString.length === 10) {
      const date = new Date(dateString);
      const isValid = !isNaN(date.getTime());
      // console.log(`📅 ISO date ${dateString} -> ${date.toISOString()} (valid: ${isValid})`);
      return isValid ? date : null;
    }
    
    // If it's in DD/MM/YYYY format, convert it
    if (dateString.includes('/') && dateString.length === 10) {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const year = parseInt(parts[2]);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      
      const date = new Date(year, month, day);
      const isValid = !isNaN(date.getTime());
      // console.log(`📅 DD/MM/YYYY date ${dateString} -> ${date.toISOString()} (valid: ${isValid})`);
      return isValid ? date : null;
    }
    
    // console.log(`❌ Unknown date format: ${dateString}`);
    return null;
  };

  const handleToggleOposicion = async (marcaId: string, index: number) => {
    try {
      const marca = marcas.find(m => m.id === marcaId);
      if (!marca) return;

      const updatedOposiciones = [...marca.oposicion];
      updatedOposiciones[index] = {
        ...updatedOposiciones[index],
        completed: !updatedOposiciones[index].completed
      };

      const response = await fetch(`/api/marcas?id=${marcaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          oposicion: updatedOposiciones,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar oposición');

      // Update local state
      setMarcas((prevMarcas) =>
        prevMarcas.map((m) => {
          if (m.id === marcaId) {
            return {
              ...m,
              oposicion: updatedOposiciones
            };
          }
          return m;
        })
      );

      toast.success('Estado de oposición actualizado');
    } catch (error) {
      console.error('Error updating oposicion:', error);
      toast.error('Error al actualizar la oposición');
    }
  };

  const handleAddAnotacion = async (marca: Marca) => {
    setSelectedMarcaForAnotacion(marca);
    setAnotacionModalOpen(true);
  };

  const handleSubmitAnotacion = async (anotacionData: Omit<Anotacion, 'id'>) => {
    if (!selectedMarcaForAnotacion) return;

    try {
      const newAnotacion = {
        id: Math.random().toString(36).substr(2, 9),
        text: anotacionData.text,
        date: anotacionData.date
      };

      const updatedAnotaciones = [...selectedMarcaForAnotacion.anotacion, newAnotacion];

      const response = await fetch(`/api/marcas?id=${selectedMarcaForAnotacion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedMarcaForAnotacion,
          anotacion: updatedAnotaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al agregar anotación');

      toast.success('Anotación agregada exitosamente');
      fetchMarcas();
      setAnotacionModalOpen(false);
      setSelectedMarcaForAnotacion(null);
    } catch (error) {
      console.error('Error adding anotacion:', error);
      toast.error('Error al agregar anotación');
    }
  };

  const handleSubmitOposicion = async (oposicionData: Omit<Oposicion, 'id'>) => {
    if (!selectedMarcaForOposicion) return;

    try {
      const newOposicion = {
        id: Math.random().toString(36).substr(2, 9),
        text: oposicionData.text,
        completed: false
      };

      const updatedOposiciones = [...selectedMarcaForOposicion.oposicion, newOposicion];

      const response = await fetch(`/api/marcas?id=${selectedMarcaForOposicion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedMarcaForOposicion,
          oposicion: updatedOposiciones,
        }),
      });

      if (!response.ok) throw new Error('Error al agregar oposición');

      toast.success('Oposición agregada exitosamente');
      fetchMarcas();
      setOposicionModalOpen(false);
      setSelectedMarcaForOposicion(null);
    } catch (error) {
      console.error('Error adding oposicion:', error);
      toast.error('Error al agregar oposición');
    }
  };

  const handleDeleteOposicion = async (marca: Marca, index: number) => {
    try {
      const updatedOposiciones = marca.oposicion.filter((_, i) => i !== index);

      const response = await fetch(`/api/marcas?id=${marca.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          oposicion: updatedOposiciones,
        }),
      });

      if (!response.ok) throw new Error('Error al eliminar oposición');

      toast.success('Oposición eliminada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error deleting oposicion:', error);
      toast.error('Error al eliminar oposición');
    }
  };

  const handleDelete = async (marca: Marca) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta marca?')) return;

    try {
      const response = await fetch('/api/marcas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: marca.id }),
      });

      if (!response.ok) throw new Error('Error al eliminar marca');

      toast.success('Marca eliminada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error deleting marca:', error);
      toast.error('Error al eliminar la marca');
    }
  };

  const handleAddOposicion = (marca: Marca) => {
    setSelectedMarcaForOposicion(marca);
    setOposicionModalOpen(true);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const addToGoogleCalendar = (marca: Marca, type: 'renovar' | 'vencimiento') => {
    const date = type === 'renovar' ? marca.renovar : marca.vencimiento;
    const title = `${type === 'renovar' ? 'Renovar' : 'Vencimiento'} marca: ${marca.marca}`;
    const titular = marca.titular ?? marca.titulares?.[0] ?? { fullName: '', email: '', phone: '' };
    const description = `Marca: ${marca.marca}\nTitular: ${titular.fullName}\nEmail: ${titular.email}\nTeléfono: ${titular.phone}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date.split('T')[0].replace(/-/g, '')}/${date.split('T')[0].replace(/-/g, '')}&details=${encodeURIComponent(description)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleDeleteAnotacion = async (marca: Marca, index: number) => {
    try {
      const updatedAnotaciones = marca.anotacion.filter((_, i) => i !== index);

      const response = await fetch(`/api/marcas?id=${marca.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...marca,
          anotacion: updatedAnotaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al eliminar anotación');

      toast.success('Anotación eliminada exitosamente');
      fetchMarcas();
    } catch (error) {
      console.error('Error deleting anotacion:', error);
      toast.error('Error al eliminar anotación');
    }
  };

  const handleManageFiles = (marcaId: string) => {
    setSelectedMarcaForFiles(marcaId);
    setFileModalOpen(true);
  };

  const handleAddMarca = () => {
    setIsModalOpen(true);
  };

  const handleUpgradeClick = () => {
    setUpgradeModalOpen(true);
  };

  const handleRowClick = (marca: Marca) => {
    setSelectedMarcaForDetail(marca);
    setDetailPanelOpen(true);
    setShowBlur(true);
  };

  const handleDetailPanelClose = () => {
    setDetailPanelOpen(false);
    setTimeout(() => {
      setShowBlur(false);
      setSelectedMarcaForDetail(null);
    }, 400);
  };

  const handleDownloadBoletin = async () => {
    setBoletinLoading(true);
    try {
      const res = await fetch('/api/boletin');
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo obtener el boletín');
      const url = data.url;
      const fileName = url.split('/').pop() || 'Boletin_Marcas.pdf';
      // Fetch the PDF via your proxy API route
      const resFile = await fetch(`/api/boletin/download?url=${encodeURIComponent(url)}`);
      if (!resFile.ok) throw new Error('No se pudo descargar el boletín');
      const blob = await resFile.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar el boletín';
      console.error('Error downloading boletin:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setBoletinLoading(false);
    }
  };

  // Check if user profile is complete
  const checkProfileComplete = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          const profile = data.profile;
          setProfileData(profile);
          const requiredFields = ['name', 'contact_number', 'agent_number', 'province', 'zip_code'];
          const isComplete = requiredFields.every(field => profile[field] && profile[field].trim() !== '');
          setProfileComplete(isComplete);
          return isComplete;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  };

  // Handle informe generation
  const handleGenerateInforme = async () => {
    if (!isPremium) {
      handleUpgradeClick();
      return;
    }

    const isProfileComplete = await checkProfileComplete();
    if (!isProfileComplete) {
      toast.error('Antes de generar un informe, completá tu perfil profesional.');
      return;
    }

    setInformeModalOpen(true);
  };

  const handleSubmitInforme = async () => {
    if (!selectedMarcaForInforme) {
      toast.error('Seleccioná una marca para generar el informe.');
      return;
    }

    setInformeLoading(true);
    try {
      const res = await fetch('/api/marcas/generate-informe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marcaId: selectedMarcaForInforme,
          includeAnotaciones,
          includeOposiciones,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al generar el informe');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe-marca-${selectedMarcaForInforme}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Informe generado exitosamente');
      setInformeModalOpen(false);
    } catch (error) {
      console.error('Error generating informe:', error);
      toast.error('Error al generar el informe');
    } finally {
      setInformeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`space-y-8 transition-all duration-300 ${showBlur ? 'filter blur-sm' : ''} ${detailPanelOpen ? 'pointer-events-none' : ''}`}>
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
            <div className="col-span-1">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestiona tus marcas comerciales de manera eficiente
              </p>
              <div className="mt-6 flex flex-row gap-3">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2 disabled:opacity-60"
                  type="button"
                  onClick={handleDownloadBoletin}
                  disabled={boletinLoading}
                >
                  <FaDownload />
                  {boletinLoading ? 'Descargando...' : 'Descargar Boletin'}
                </button>
                <button
                  className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-transform duration-200 flex items-center gap-2 ${
                    isPremium 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  type="button"
                  onClick={handleGenerateInforme}
                  disabled={!isPremium}
                >
                  {isPremium ? <FaFileAlt /> : <FaLock />}
                  {isPremium ? 'Generar informe' : 'Generar informe'}
                </button>
              </div>
              {!isPremium && (
                <p className="text-xs text-gray-500 italic mt-2">
                  La generación de informes está disponible en el plan Premium.{' '}
                  <span className="text-indigo-600 hover:underline cursor-pointer" onClick={handleUpgradeClick}>Ver planes</span>
                </p>
              )}
            </div>
            <div className="flex md:justify-end justify-start items-center gap-4 mt-4 md:mt-0">
              <SubscriptionStatus marcaCount={totalMarcas} onUpgradeClick={handleUpgradeClick} />
            </div>
          </div>

          {/* Migration Notice */}
          {needsMigration && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Actualización de base de datos requerida
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Se requiere una actualización de la base de datos. Por favor, visita la página de migración.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        onClick={() => router.push('/migrate')}
                        className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                      >
                        Ir a migración
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!needsMigration && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Total Marcas */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-600 bg-opacity-30 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white uppercase">Marcas Activas</p>
                      <p className="text-3xl font-bold text-white">{totalMarcas}</p>
                    </div>
                  </div>
                </div>

                {/* Próximo a Renovar */}
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-5 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-yellow-600 bg-opacity-30 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white uppercase">{getCardTitle()}</p>
                      <p className="text-3xl font-bold text-white">{calculateProximosVencer()}</p>
                    </div>
                  </div>
                  
                  {/* Settings Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDateFilterModalOpen(true)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 cursor-pointer"
                      title="Configurar filtros"
                    >
                      <FaCog className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Con Oposiciones */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-red-600 bg-opacity-30 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white uppercase">Con Oposiciones</p>
                      <p className="text-3xl font-bold text-white">{marcasConOposiciones}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Lista de Marcas</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddMarca}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <FaPlus className="h-4 w-4 mr-2" />
                    Agregar Marca
                  </motion.button>
                </div>
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-4">
                  {getFilteredMarcas().map((marca) => {
                    const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
                      ? marca.titulares.map(t => t.fullName).filter(Boolean).join(', ')
                      : (marca.titular?.fullName || '');
                    return (
                      <div
                        key={marca.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => handleRowClick(marca)}
                      >
                        <div className="text-sm font-semibold text-gray-900">Marca</div>
                        <div className="text-base text-gray-900 break-words">{truncateText(marca.marca, 30)}</div>
                        <div className="text-sm font-semibold text-gray-500 mt-2">Titular</div>
                        <div className="text-base text-gray-700 break-words">{titulares}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Desktop Table */}
                <div className="hidden sm:block flow-root">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              <div className="min-w-[200px]">Marca</div>
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              <div className="min-w-[200px]">Titular</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {getFilteredMarcas().map((marca) => {
                            const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
                              ? marca.titulares.map(t => t.fullName).filter(Boolean).join(', ')
                              : (marca.titular?.fullName || '');
                            return (
                              <tr 
                                key={marca.id}
                                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                onClick={() => handleRowClick(marca)}
                              >
                                <td className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                  <div className="min-w-[200px]">
                                    {truncateText(marca.marca, 30)}
                                  </div>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500">
                                  <div className="min-w-[200px]">
                                    {titulares}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals and Panels */}
      <AddMarcaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMarca(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedMarca}
      />

      <ViewTextModal
        isOpen={viewTextModal.isOpen}
        onClose={() => setViewTextModal({ isOpen: false, title: '', content: '' })}
        title={viewTextModal.title}
        content={viewTextModal.content}
      />

      {selectedOposicion && (
        <OposicionModal
          isOpen={oposicionModalOpen}
          onClose={() => {
            setOposicionModalOpen(false);
            setSelectedOposicion(null);
          }}
          oposicion={selectedOposicion.oposicion}
          onComplete={() => {
            handleToggleOposicion(selectedOposicion.marcaId, selectedOposicion.index);
            setSelectedOposicion(null);
            setOposicionModalOpen(false);
          }}
        />
      )}

      {selectedMarcaForOposicion && (
        <OposicionModal
          isOpen={oposicionModalOpen}
          onClose={() => {
            setOposicionModalOpen(false);
            setSelectedMarcaForOposicion(null);
          }}
          onSubmit={handleSubmitOposicion}
        />
      )}

      {selectedMarcaForFiles && (
        <UploadFileModal
          marcaId={selectedMarcaForFiles}
          isOpen={fileModalOpen}
          onClose={() => {
            setFileModalOpen(false);
            setSelectedMarcaForFiles(null);
          }}
        />
      )}

      {selectedMarcaForAnotacion && (
        <AnotacionModal
          isOpen={anotacionModalOpen}
          onClose={() => {
            setAnotacionModalOpen(false);
            setSelectedMarcaForAnotacion(null);
          }}
          onSubmit={handleSubmitAnotacion}
        />
      )}

      {upgradeModalOpen && (
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
        />
      )}

      <WelcomeModal
        isOpen={welcomeModalOpen}
        onClose={handleWelcomeClose}
      />

      {/* Slide-out Panel rendered outside the blurred content for proper animation */}
      {(() => {
        // console.log('Panel render check:', { detailPanelOpen, selectedMarcaForDetail });
        return detailPanelOpen && selectedMarcaForDetail ? (
          <MarcaDetailPanel
            isOpen={detailPanelOpen}
            marca={selectedMarcaForDetail}
            onClose={handleDetailPanelClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddOposicion={handleAddOposicion}
            onAddAnotacion={handleAddAnotacion}
            onManageFiles={handleManageFiles}
            onToggleOposicion={handleToggleOposicion}
            onDeleteOposicion={handleDeleteOposicion}
            onDeleteAnotacion={handleDeleteAnotacion}
            onViewText={(title, content) => setViewTextModal({ isOpen: true, title, content })}
            onAddToCalendar={addToGoogleCalendar}
          />
        ) : null;
      })()}

      {/* Date Filter Modal */}
      <DateFilterModal
        isOpen={dateFilterModalOpen}
        onClose={() => setDateFilterModalOpen(false)}
        dateType={selectedDateType}
        timeRange={selectedTimeRange}
        onDateTypeChange={setSelectedDateType}
        onTimeRangeChange={setSelectedTimeRange}
      />

      {/* Growth Banner */}
      <GrowthBanner />

      {/* Modal for boletin scan - DEBE PERMANECER COMENTADO */}
      {/*
      <AnimatePresence>
        {boletinScanModalOpen && (
          <BoletinScanModal
            isOpen={boletinScanModalOpen}
            onClose={() => {
              setBoletinScanModalOpen(false);
              setBoletinScanResults(null);
            }}
            isPremium={isPremium}
            onFileChange={async (file) => {
              // Client-side validation
              const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
              
              if (file.size > MAX_FILE_SIZE) {
                toast.error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). El tamaño máximo permitido es 4MB.`);
                return;
              }
              
              if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
                toast.error('Solo se permiten archivos PDF.');
                return;
              }
              
              setBoletinScanLoading(true);
              setBoletinScanResults(null);
              
              try {
                // console.log('📁 Uploading file:', file.name, 'Size:', file.size);
                
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch('/api/boletin/scan', {
                  method: 'POST',
                  body: formData,
                });
                
                // console.log('📡 Response status:', response.status);
                
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('❌ API Error Response:', errorText);
                  
                  let errorMessage = 'Error al procesar el boletín';
                  try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                  } catch (parseError) {
                    console.error('❌ Could not parse error response:', parseError);
                  }
                  
                  throw new Error(errorMessage);
                }
                
                const data = await response.json();
                // console.log('✅ API Response:', data);
                setBoletinScanResults(data.data);
                toast.success('Boletín analizado exitosamente');
              } catch (error) {
                console.error('❌ Error scanning boletin:', error);
                toast.error(error instanceof Error ? error.message : 'Error al escanear el boletín');
              } finally {
                setBoletinScanLoading(false);
              }
            }}
            loading={boletinScanLoading}
            scanResults={boletinScanResults}
          />
        )}
      </AnimatePresence>
      */}

      {/* Modal for informe generation */}
      <AnimatePresence>
        {informeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blur background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300"
              onClick={() => setInformeModalOpen(false)}
            />
            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-8 z-20"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setInformeModalOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>

              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="bg-indigo-100 rounded-full p-4 mb-2">
                  <FaFileAlt className="text-indigo-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Generar informe de marca</h2>
                <p className="text-gray-600 text-center max-w-xs">
                  Seleccioná una marca y configurá qué información incluir en el informe.
                </p>
              </div>

              {/* Marca selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar marca
                </label>
                <select
                  value={selectedMarcaForInforme}
                  onChange={(e) => setSelectedMarcaForInforme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                >
                  <option value="">Seleccioná una marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.marca}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected marca info */}
              {selectedMarcaForInforme && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Información de la marca</h3>
                  {(() => {
                    const marca = marcas.find(m => m.id === selectedMarcaForInforme);
                    if (!marca) return null;
                    
                                         return (
                       <div className="space-y-2 text-sm text-gray-600">
                         <div><strong>📝 Marca:</strong> {marca.marca}</div>
                         <div><strong>🏛️ Clases:</strong> {marca.clases?.join(', ') || 'No especificadas'}</div>
                         <div><strong>🔄 Fecha de renovación:</strong> {marca.renovar || 'No especificada'}</div>
                         <div><strong>⏰ Fecha de vencimiento:</strong> {marca.vencimiento || 'No especificada'}</div>
                         <div><strong>👥 Titulares:</strong> {
                           Array.isArray(marca.titulares) && marca.titulares.length > 0
                             ? marca.titulares.map(t => {
                                 const contactInfo = [];
                                 if (t.fullName) contactInfo.push(t.fullName);
                                 if (t.email) contactInfo.push(`📧 ${t.email}`);
                                 if (t.phone) contactInfo.push(`📞 ${t.phone}`);
                                 return contactInfo.join(' | ');
                               }).join(', ')
                             : marca.titular?.fullName || 'No especificados'
                         }</div>
                       </div>
                     );
                  })()}
                </div>
              )}

              {/* Optional sections */}
              <div className="mb-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Secciones opcionales</h3>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeAnotaciones}
                    onChange={(e) => setIncludeAnotaciones(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Incluir anotaciones del agente</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeOposiciones}
                    onChange={(e) => setIncludeOposiciones(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Incluir oposiciones registradas</span>
                </label>
              </div>

              {/* Generate button */}
              <button
                onClick={handleSubmitInforme}
                disabled={!selectedMarcaForInforme || informeLoading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {informeLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando informe...
                  </>
                ) : (
                  <>
                    <FaFileAlt />
                    Confirmar y generar informe
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 