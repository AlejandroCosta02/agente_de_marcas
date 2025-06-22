'use client';

import Link from 'next/link';
import { FaGavel, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import LegalNavbar from '@/components/LegalNavbar';
import Footer from '@/components/Footer';
import SmartBackButton from '@/components/SmartBackButton';

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LegalNavbar />

      <main className="flex-grow">
        <div className="bg-white py-4 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SmartBackButton />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-center space-x-3 mb-6">
                <FaGavel className="text-blue-600" size={24} />
                <h2 className="text-3xl font-bold text-gray-900">Términos de Servicio</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
              </p>

              <div className="space-y-8">
                {/* Introducción */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h3>
                  <p className="text-gray-700 mb-4">
                    Al acceder y utilizar el servicio de Agente de Marcas (&quot;el Servicio&quot;), usted acepta estar 
                    sujeto a estos Términos de Servicio (&quot;Términos&quot;). Si no está de acuerdo con alguna parte 
                    de estos términos, no debe utilizar nuestro servicio.
                  </p>
                  <p className="text-gray-700">
                    Estos términos constituyen un acuerdo legal entre usted y Agente de Marcas.
                  </p>
                </section>

                {/* Descripción del servicio */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h3>
                  <p className="text-gray-700 mb-4">
                    Agente de Marcas es una plataforma de gestión de marcas comerciales que permite a los usuarios:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Gestionar y organizar sus marcas comerciales</li>
                    <li>Almacenar documentos relacionados con marcas</li>
                    <li>Recibir notificaciones de renovaciones y vencimientos</li>
                    <li>Acceder a información de titularidad y clases de productos</li>
                    <li>Subir y gestionar archivos relacionados con sus marcas</li>
                  </ul>
                </section>

                {/* Registro y cuenta */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">3.1 Creación de Cuenta</h4>
                      <p className="text-gray-700">
                        Para utilizar nuestro servicio, debe crear una cuenta proporcionando información 
                        precisa y completa. Usted es responsable de mantener la confidencialidad de su 
                        contraseña y de todas las actividades que ocurran bajo su cuenta.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">3.2 Responsabilidades de la Cuenta</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Mantener la información de su cuenta actualizada</li>
                        <li>Notificar inmediatamente cualquier uso no autorizado</li>
                        <li>No compartir sus credenciales de acceso</li>
                        <li>Ser responsable de todas las actividades en su cuenta</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Uso aceptable */}
                <section>
                  <div className="flex items-center space-x-3 mb-4">
                    <FaCheckCircle className="text-green-600" size={20} />
                    <h3 className="text-xl font-semibold text-gray-900">4. Uso Aceptable</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Usted se compromete a utilizar el servicio únicamente para fines legales y de acuerdo 
                    con estos términos. Está prohibido:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Usar el servicio para actividades ilegales o fraudulentas</li>
                    <li>Intentar acceder no autorizado a sistemas o datos</li>
                    <li>Interferir con el funcionamiento del servicio</li>
                    <li>Subir contenido malicioso o archivos infectados</li>
                    <li>Violar derechos de propiedad intelectual de terceros</li>
                    <li>Usar el servicio para spam o contenido ofensivo</li>
                  </ul>
                </section>

                {/* Contenido del usuario */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Contenido del Usuario</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">5.1 Propiedad del Contenido</h4>
                      <p className="text-gray-700">
                        Usted conserva la propiedad de todo el contenido que suba al servicio. 
                        Al subir contenido, nos otorga una licencia limitada para almacenar y 
                        procesar dicho contenido únicamente para proporcionar el servicio.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">5.2 Responsabilidad del Contenido</h4>
                      <p className="text-gray-700">
                        Usted es responsable de todo el contenido que suba, incluyendo su legalidad, 
                        precisión y cumplimiento con estos términos. No nos hacemos responsables 
                        del contenido generado por usuarios.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">5.3 Tipos de Archivos Permitidos</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Documentos PDF relacionados con marcas comerciales</li>
                        <li>Certificados de registro</li>
                        <li>Documentos de renovación</li>
                        <li>Otros documentos legales relacionados</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Privacidad y datos */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Privacidad y Protección de Datos</h3>
                  <p className="text-gray-700 mb-4">
                    Su privacidad es importante para nosotros. El uso de su información personal 
                    se rige por nuestra Política de Privacidad, que forma parte de estos términos.
                  </p>
                  <p className="text-gray-700">
                    Al utilizar nuestro servicio, usted consiente el procesamiento de sus datos 
                    personales de acuerdo con nuestra Política de Privacidad.
                  </p>
                </section>

                {/* Propiedad intelectual */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Propiedad Intelectual</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">7.1 Nuestros Derechos</h4>
                      <p className="text-gray-700">
                        El servicio y su contenido original, características y funcionalidad son 
                        propiedad de Agente de Marcas y están protegidos por leyes de propiedad 
                        intelectual.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">7.2 Licencia de Uso</h4>
                      <p className="text-gray-700">
                        Le otorgamos una licencia limitada, no exclusiva y revocable para usar 
                        el servicio únicamente para gestionar sus marcas comerciales.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Limitación de responsabilidad */}
                <section>
                  <div className="flex items-center space-x-3 mb-4">
                    <FaExclamationTriangle className="text-yellow-600" size={20} />
                    <h3 className="text-xl font-semibold text-gray-900">8. Limitación de Responsabilidad</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    En la máxima medida permitida por la ley, Agente de Marcas no será responsable por:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Daños indirectos, incidentales o consecuentes</li>
                    <li>Pérdida de datos o información</li>
                    <li>Interrupciones del servicio</li>
                    <li>Errores en la información proporcionada</li>
                    <li>Acciones de terceros</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Nuestra responsabilidad total no excederá el monto pagado por el servicio en los 
                    últimos 12 meses.
                  </p>
                </section>

                {/* Terminación */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Terminación</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">9.1 Terminación por el Usuario</h4>
                      <p className="text-gray-700">
                        Puede cancelar su cuenta en cualquier momento a través de la configuración 
                        de su perfil o contactándonos directamente.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">9.2 Terminación por Nosotros</h4>
                      <p className="text-gray-700">
                        Podemos suspender o terminar su acceso al servicio en cualquier momento 
                        si viola estos términos o por cualquier otra razón a nuestra discreción.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">9.3 Efectos de la Terminación</h4>
                      <p className="text-gray-700">
                        Al terminar su cuenta, perderá acceso al servicio y sus datos pueden 
                        ser eliminados según nuestra Política de Privacidad.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Modificaciones */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Modificaciones de los Términos</h3>
                  <p className="text-gray-700">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                    Los cambios entrarán en vigor inmediatamente después de su publicación. 
                    Su uso continuado del servicio después de los cambios constituye aceptación 
                    de los nuevos términos.
                  </p>
                </section>

                {/* Ley aplicable */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Ley Aplicable y Jurisdicción</h3>
                  <p className="text-gray-700">
                    Estos términos se rigen por las leyes de [País/Jurisdicción]. Cualquier 
                    disputa será resuelta en los tribunales competentes de [Ciudad, País].
                  </p>
                </section>

                {/* Contacto */}
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Contacto</h3>
                  <p className="text-gray-700 mb-4">
                    Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Email:</strong> legal@agentedemarcas.com<br />
                      <strong>Dirección:</strong> [Dirección de la empresa]<br />
                      <strong>Teléfono:</strong> [Número de teléfono]
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 