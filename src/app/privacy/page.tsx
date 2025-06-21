'use client';

import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt, FaDatabase, FaCloud, FaUserShield } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft size={16} />
                <span>Volver al Inicio</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-lg max-w-none">
            <div className="flex items-center space-x-3 mb-6">
              <FaShieldAlt className="text-blue-600" size={24} />
              <h2 className="text-3xl font-bold text-gray-900">Política de Privacidad</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
            </p>

            <div className="space-y-8">
              {/* Introducción */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Introducción</h3>
                <p className="text-gray-700 mb-4">
                  Agente de Marcas ("nosotros", "nuestro", "la empresa") se compromete a proteger la privacidad 
                  de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos, 
                  almacenamos y protegemos su información personal cuando utiliza nuestro servicio de gestión 
                  de marcas comerciales.
                </p>
                <p className="text-gray-700">
                  Al utilizar nuestro servicio, usted acepta las prácticas descritas en esta política.
                </p>
              </section>

              {/* Información que recopilamos */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">2.1 Información Personal</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Nombre completo y apellidos</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Número de teléfono</li>
                      <li>Información de la empresa (si aplica)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">2.2 Información de Marcas Comerciales</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Nombre de la marca</li>
                      <li>Información de renovación y vencimiento</li>
                      <li>Datos del titular</li>
                      <li>Clases de productos/servicios</li>
                      <li>Documentos y archivos relacionados</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">2.3 Información Técnica</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Dirección IP</li>
                      <li>Tipo de navegador y dispositivo</li>
                      <li>Sistema operativo</li>
                      <li>Páginas visitadas y tiempo de uso</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cómo utilizamos la información */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Cómo Utilizamos su Información</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Proporcionar y mantener nuestro servicio de gestión de marcas</li>
                  <li>Gestionar su cuenta y autenticación</li>
                  <li>Enviar notificaciones sobre renovaciones y vencimientos</li>
                  <li>Mejorar nuestros servicios y experiencia del usuario</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Responder a consultas y solicitudes de soporte</li>
                </ul>
              </section>

              {/* Almacenamiento y seguridad */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <FaDatabase className="text-green-600" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">4. Almacenamiento y Seguridad</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">4.1 Base de Datos</h4>
                    <p className="text-gray-700">
                      Su información se almacena en bases de datos PostgreSQL seguras, 
                      protegidas con encriptación y acceso restringido.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">4.2 Almacenamiento de Archivos</h4>
                    <p className="text-gray-700">
                      Los documentos y archivos que suba se almacenan de forma segura en 
                      Amazon Web Services (AWS) S3, con encriptación en tránsito y en reposo.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">4.3 Medidas de Seguridad</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                      <li>Autenticación segura con NextAuth.js</li>
                      <li>Acceso restringido a datos sensibles</li>
                      <li>Copias de seguridad regulares</li>
                      <li>Monitoreo continuo de seguridad</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Compartir información */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Compartir Información</h3>
                <p className="text-gray-700 mb-4">
                  No vendemos, alquilamos ni compartimos su información personal con terceros, 
                  excepto en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Con su consentimiento explícito</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Con proveedores de servicios que nos ayudan a operar (AWS, etc.)</li>
                  <li>Para proteger nuestros derechos y seguridad</li>
                </ul>
              </section>

              {/* Sus derechos */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <FaUserShield className="text-purple-600" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">6. Sus Derechos</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Usted tiene los siguientes derechos respecto a su información personal:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                  <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies y Tecnologías Similares</h3>
                <p className="text-gray-700 mb-4">
                  Utilizamos cookies y tecnologías similares para:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Mantener su sesión activa</li>
                  <li>Recordar sus preferencias</li>
                  <li>Analizar el uso del sitio</li>
                  <li>Mejorar la funcionalidad</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Puede controlar el uso de cookies a través de la configuración de su navegador.
                </p>
              </section>

              {/* Cambios en la política */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Cambios en esta Política</h3>
                <p className="text-gray-700">
                  Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en nuestro sitio web. 
                  Le notificaremos sobre cambios significativos por correo electrónico.
                </p>
              </section>

              {/* Contacto */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Contacto</h3>
                <p className="text-gray-700 mb-4">
                  Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos su información, 
                  puede contactarnos:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacidad@agentedemarcas.com<br />
                    <strong>Dirección:</strong> [Dirección de la empresa]<br />
                    <strong>Teléfono:</strong> [Número de teléfono]
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 