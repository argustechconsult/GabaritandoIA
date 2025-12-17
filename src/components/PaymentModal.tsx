import React, { useState } from 'react';
import { createCheckoutSession } from '../services/gatewayPayment';
import { User } from '../types';

interface PaymentModalProps {
  onClose: () => void;
  onSimulatePayment: () => void; // Keeping for fallback/dev
  user: User | null; // Added user prop to pass to gateway
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSimulatePayment, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
        // Try to create the real checkout session (or simulated if no key)
        const url = await createCheckoutSession(user);
        
        // Redirect user to AbacatePay (or back to app in simulation)
        window.location.href = url;
    } catch (err) {
        // If it genuinely fails (e.g., real key but network down), show error message in UI
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Erro desconhecido ao processar pagamento.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Desbloqueie o Ilimitado</h2>
            <p className="text-indigo-100">Torne-se um mestre nos estudos agora!</p>
        </div>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                {/* Avocado-ish color or just payment icon */}
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          
          <p className="text-gray-600 text-center mb-6">
            Você atingiu o limite do plano gratuito (1 PDF). Para gerar materiais de estudo ilimitados, assine o plano Premium.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 text-center">
             <span className="text-3xl font-bold text-gray-800">R$ 10,00</span>
             <span className="text-gray-500 text-sm"> / mês</span>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded">{error}</p>}

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-[#2C3E2C] hover:bg-[#3A523A] text-white font-semibold rounded-lg shadow transition-colors duration-200 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
              ) : (
                  'Pagar com AbacatePay'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-gray-400">Pagamento seguro via AbacatePay</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;