import React, { useState } from 'react';
import { User } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      onLogin({ username: 'admin', role: 'admin', hasPaid: true });
    } else if (username === 'usuario' && password === 'usuario') {
       // Usuário específico para teste do plano Free
       onLogin({ username: 'usuario', role: 'user', hasPaid: false });
    } else if (username === 'premium' && password === 'premium') {
       // Usuário específico para teste do plano Premium
       onLogin({ username: 'premium', role: 'user', hasPaid: true });
    } else if (username && password) {
      // Simulate normal user login for anyone else (Default Free)
      onLogin({ username, role: 'user', hasPaid: false });
    } else {
      setError('Preencha todos os campos.');
    }
  };

  const fillCredentials = (user: string, pass: string) => {
      setUsername(user);
      setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-start">
        
        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden order-2 md:order-1">
            <div className="bg-indigo-600 p-8 text-center flex flex-col items-center justify-center">
                <Logo className="h-16 text-white mb-2" />
                <p className="text-indigo-200 mt-2">Seu assistente de estudos inteligente</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Digite seu usuário"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Digite sua senha"
                />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-200"
            >
                Entrar
            </button>
            </form>
        </div>

        {/* Credentials Info Panel */}
        <div className="flex flex-col space-y-4 order-1 md:order-2">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Credenciais de Teste</h3>
                <p className="text-sm text-gray-600 mb-4">Clique em um cartão abaixo para preencher automaticamente.</p>
                
                <div className="space-y-3">
                    <div 
                        onClick={() => fillCredentials('admin', 'admin')}
                        className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer transition-colors group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-purple-700">Admin</span>
                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Ilimitado</span>
                        </div>
                        <div className="text-xs text-purple-600 mt-1">User: admin | Pass: admin</div>
                    </div>

                    <div 
                        onClick={() => fillCredentials('premium', 'premium')}
                        className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-colors group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-700">Premium</span>
                            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Ilimitado</span>
                        </div>
                        <div className="text-xs text-amber-600 mt-1">User: premium | Pass: premium</div>
                    </div>

                    <div 
                        onClick={() => fillCredentials('usuario', 'usuario')}
                        className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-colors group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Usuário Free</span>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">1 PDF Grátis</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">User: usuario | Pass: usuario</div>
                    </div>
                </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p>💡 <strong>Dica:</strong> O usuário <b>Free</b> será bloqueado ao tentar enviar o segundo PDF, ativando o fluxo de pagamento do AbacatePay.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;