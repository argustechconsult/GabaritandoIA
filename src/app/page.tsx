'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type {
  User,
  DocumentData,
  Folder,
  QuizQuestion,
  Flashcard,
  Subject,
} from '../types';
import Login from '../components/Login';
import PaymentModal from '../components/PaymentModal';
import Flashcards from '../components/Flashcards';
import MindMap from '../components/MindMap';
import Quiz from '../components/Quiz';
import Logo from '../components/Logo';
import { processPdfContent } from '../services/geminiService';

enum Tab {
  FLASHCARDS = 'Flashcards',
  MINDMAP = 'Mapa Mental',
  QUIZ = 'Questionário',
}

enum SidebarView {
  MY_DOCS = 'MY_DOCS',
  GLOBAL_QUIZ = 'GLOBAL_QUIZ',
  GLOBAL_FLASHCARDS = 'GLOBAL_FLASHCARDS',
}

// Mapeamento de Concursos para Matérias
const CONTEST_STRUCTURE: Record<string, Subject[]> = {
  'Concursos Policiais (PF, PRF, PC, PM)': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Informática',
    'Atualidades',
    'Direitos Humanos',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Penal',
    'Direito Processual Penal',
    'Legislação Penal Especial',
    'Criminologia',
  ],
  'Concursos Fiscais (Receita, SEFAZ, ISS)': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Estatística',
    'Informática',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Tributário',
    'Legislação Tributária',
    'Contabilidade Geral',
    'Contabilidade Pública',
    'Auditoria',
    'Economia',
    'Finanças Públicas',
  ],
  'Concursos de Tribunais (TJ, TRF, TRT, TRE)': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Informática',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Civil',
    'Direito Processual Civil',
    'Direito Penal',
    'Direito Processual Penal',
    'Direito do Trabalho',
    'Direito Processual do Trabalho',
  ],
  'Concursos Administrativos': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Matemática',
    'Informática',
    'Direito Constitucional',
    'Direito Administrativo',
    'Administração Pública',
    'Administração Geral',
    'Arquivologia',
    'Gestão de Pessoas',
    'AFO',
  ],
  'Concursos INSS / Previdenciários': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Informática',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Previdenciário',
    'Seguridade Social',
    'Ética no Serviço Público',
  ],
  'Concursos Bancários': [
    'Língua Portuguesa',
    'Matemática',
    'Raciocínio Lógico',
    'Informática',
    'Atualidades',
    'Conhecimentos Bancários',
    'Sistema Financeiro Nacional',
    'Matemática Financeira',
    'Vendas e Negociação',
  ],
  'Concursos de Controle (TCU, CGU)': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Estatística',
    'Direito Constitucional',
    'Direito Administrativo',
    'Administração Pública',
    'Contabilidade Geral',
    'Contabilidade Pública',
    'Auditoria',
    'AFO',
    'Economia',
    'Finanças Públicas',
  ],
  'Concursos Jurídicos (Juiz, MP, Defensoria)': [
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Civil',
    'Direito Processual Civil',
    'Direito Penal',
    'Direito Processual Penal',
    'Direito do Trabalho',
    'Direito Processual do Trabalho',
    'Direito Tributário',
    'Direito Empresarial',
    'Direitos Humanos',
    'Filosofia e Sociologia',
  ],
  'Concursos de TI': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Tecnologia da Informação',
    'Algoritmos e Programação',
    'Banco de Dados',
    'Engenharia de Software',
    'Redes de Computadores',
    'Segurança da Informação',
  ],
  'Concursos da Saúde': [
    'Língua Portuguesa',
    'Informática',
    'Políticas Públicas de Saúde',
    'SUS',
    'Saúde Pública',
    'Epidemiologia',
    'Ética no Serviço Público',
  ],
  'Concursos da Educação': [
    'Língua Portuguesa',
    'Informática',
    'Legislação Educacional',
    'Educação (LDB, BNCC, Didática)',
  ],
  'Concursos Militares': [
    'Língua Portuguesa',
    'Matemática',
    'Física',
    'Química',
    'História',
    'Geografia',
    'Conhecimentos Militares',
    'Legislação Militar',
  ],
  'Concursos Ambientais (IBAMA, ICMBio)': [
    'Língua Portuguesa',
    'Informática',
    'Direito Ambiental',
    'Legislação Ambiental',
    'Direito Administrativo',
  ],
  'Agências Reguladoras': [
    'Língua Portuguesa',
    'Raciocínio Lógico',
    'Direito Administrativo',
    'Regulação e Agências',
  ],
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  // Data States
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // Global DB States
  const [globalQuestions, setGlobalQuestions] = useState<QuizQuestion[]>([]);
  const [globalFlashcards, setGlobalFlashcards] = useState<Flashcard[]>([]);

  // UI States
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.FLASHCARDS);
  const [sidebarView, setSidebarView] = useState<SidebarView>(
    SidebarView.MY_DOCS,
  );

  // Global Quiz/Flashcard View State
  const [selectedContest, setSelectedContest] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');
  const [activeGlobalQuiz, setActiveGlobalQuiz] = useState<
    QuizQuestion[] | null
  >(null);
  const [activeGlobalFlashcards, setActiveGlobalFlashcards] = useState<
    Flashcard[] | null
  >(null);

  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileDocs, setShowMobileDocs] = useState(false);

  // States for renaming, deleting and drag-drop
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Drag and Drop States
  const [draggingDocId, setDraggingDocId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // State for creating new folder inline
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // --- Auth & Init ---
  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('gabaritando_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gabaritando_user');
    setDocs([]);
    setFolders([]);
    setActiveDocId(null);
    setActiveGlobalQuiz(null);
    setActiveGlobalFlashcards(null);
    setSidebarView(SidebarView.MY_DOCS);
    setExpandedFolderIds(new Set());
  };

  // Check Payment Query Params
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const status = queryParams.get('status');
      if (status === 'paid') {
        const saved = localStorage.getItem('gabaritando_user');
        if (saved) {
          const currentUser = JSON.parse(saved);
          const updatedUser = { ...currentUser, hasPaid: true };
          setUser(updatedUser);
          localStorage.setItem('gabaritando_user', JSON.stringify(updatedUser));
          alert('Pagamento confirmado! Sua conta agora é Premium.');
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      }
    }
  }, []);

  // Load User & Global DB on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gabaritando_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedGlobalQuiz = localStorage.getItem('gabaritando_global_quiz_db');
    const savedGlobalFlash = localStorage.getItem(
      'gabaritando_global_flash_db',
    );

    if (savedGlobalQuiz) setGlobalQuestions(JSON.parse(savedGlobalQuiz));
    if (savedGlobalFlash) setGlobalFlashcards(JSON.parse(savedGlobalFlash));
  }, []);

  // Reset Subject when Contest changes
  useEffect(() => {
    setSelectedSubject('');
  }, [selectedContest]);

  const appendToGlobalDB = (
    questions: QuizQuestion[],
    flashcards: Flashcard[],
    subject: Subject,
  ) => {
    const newQuestions = questions.map((q) => ({ ...q, subject }));
    const newFlashcards = flashcards.map((f) => ({ ...f, subject }));

    const updatedQuestions = [...globalQuestions, ...newQuestions];
    const updatedFlashcards = [...globalFlashcards, ...newFlashcards];

    setGlobalQuestions(updatedQuestions);
    setGlobalFlashcards(updatedFlashcards);

    localStorage.setItem(
      'gabaritando_global_quiz_db',
      JSON.stringify(updatedQuestions),
    );
    localStorage.setItem(
      'gabaritando_global_flash_db',
      JSON.stringify(updatedFlashcards),
    );
  };

  // --- Folder Logic ---
  const handleCreateFolderStart = () => {
    if (user?.role !== 'admin' && !user?.hasPaid) {
      setShowPayment(true);
      return;
    }
    setIsCreatingFolder(true);
    setNewFolderName('');
    setShowMobileDocs(true);
  };

  const saveNewFolder = () => {
    if (newFolderName.trim()) {
      const newId = Date.now().toString();
      const newFolder: Folder = { id: newId, name: newFolderName.trim() };
      setFolders((prev) => [...prev, newFolder]);
      setExpandedFolderIds((prev) => new Set(prev).add(newId));
    }
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const cancelCreateFolder = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });
  };

  // --- Drag & Drop ---
  const onDragStart = (e: React.DragEvent, docId: string) => {
    setDraggingDocId(docId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDragEnterFolder = (folderId: string) => {
    if (draggingDocId) setDragOverFolderId(folderId);
  };
  const onDragLeaveFolder = () => {
    setDragOverFolderId(null);
  };
  const onDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    if (draggingDocId) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === draggingDocId ? { ...d, folderId: folderId } : d,
        ),
      );
      setDraggingDocId(null);
      setExpandedFolderIds((prev) => new Set(prev).add(folderId));
    }
  };
  const onDropOnRoot = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
    if (draggingDocId) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === draggingDocId ? { ...d, folderId: null } : d,
        ),
      );
      setDraggingDocId(null);
    }
  };

  // --- Document Processing ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.type !== 'application/pdf') {
      alert('Apenas arquivos .pdf são permitidos.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo excede o limite de 5MB.');
      e.target.value = '';
      return;
    }
    if (user?.role !== 'admin' && docs.length >= 1 && !user?.hasPaid) {
      setShowPayment(true);
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    setShowMobileDocs(false);

    const docId = Date.now().toString();
    const newDoc: DocumentData = {
      id: docId,
      name: file.name,
      timestamp: Date.now(),
      content: null,
      isLoading: true,
      folderId: null,
    };

    setDocs((prev) => [newDoc, ...prev]);
    setActiveDocId(docId);
    setSidebarView(SidebarView.MY_DOCS); // Switch back to docs view

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const generatedContent = await processPdfContent(
            base64Data,
            file.type,
          );

          setDocs((prev) =>
            prev.map((d) =>
              d.id === docId
                ? { ...d, content: generatedContent, isLoading: false }
                : d,
            ),
          );

          // Feed the Global DB
          if (generatedContent) {
            appendToGlobalDB(
              generatedContent.quiz,
              generatedContent.flashcards,
              generatedContent.subject,
            );
          }
        } catch (err: any) {
          console.error(err);
          setDocs((prev) =>
            prev.map((d) =>
              d.id === docId
                ? {
                    ...d,
                    isLoading: false,
                    error: err?.message || 'Falha ao processar.',
                  }
                : d,
            ),
          );
        }
      };
    } catch (error) {
      console.error('File reading error', error);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handlePaymentSuccess = () => {
    if (user) {
      const updatedUser = { ...user, hasPaid: true };
      setUser(updatedUser);
      localStorage.setItem('gabaritando_user', JSON.stringify(updatedUser));
      setShowPayment(false);
      alert('Pagamento realizado com sucesso! Agora você é Premium.');
    }
  };

  // --- Document Management ---
  const startRenaming = (e: React.MouseEvent, doc: DocumentData) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setTempName(doc.name);
  };
  const saveRename = () => {
    if (editingDocId && tempName.trim())
      setDocs((prev) =>
        prev.map((d) => (d.id === editingDocId ? { ...d, name: tempName } : d)),
      );
    setEditingDocId(null);
    setTempName('');
  };
  const confirmDelete = () => {
    if (deletingDocId) {
      setDocs((prev) => prev.filter((d) => d.id !== deletingDocId));
      if (activeDocId === deletingDocId) setActiveDocId(null);
      setDeletingDocId(null);
    }
  };

  // --- Global Logic ---
  const handleOpenGlobalQuiz = () => {
    if (user?.role !== 'admin' && !user?.hasPaid) {
      setShowPayment(true);
      return;
    }
    setSidebarView(SidebarView.GLOBAL_QUIZ);
    setActiveGlobalQuiz(null);
    // Reset selections
    setSelectedContest('');
    setSelectedSubject('');
    setShowMobileDocs(false);
  };

  const handleOpenGlobalFlashcards = () => {
    if (user?.role !== 'admin' && !user?.hasPaid) {
      setShowPayment(true);
      return;
    }
    setSidebarView(SidebarView.GLOBAL_FLASHCARDS);
    setActiveGlobalFlashcards(null);
    // Reset selections
    setSelectedContest('');
    setSelectedSubject('');
    setShowMobileDocs(false);
  };

  const startGlobalQuiz = () => {
    if (!selectedSubject) return;

    const filtered = globalQuestions.filter(
      (q) => q.subject === selectedSubject,
    );
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setActiveGlobalQuiz(shuffled.slice(0, 20));
  };

  const startGlobalFlashcards = () => {
    if (!selectedSubject) return;

    const filtered = globalFlashcards.filter(
      (f) => f.subject === selectedSubject,
    );
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    // Changed to 40 cards per session
    setActiveGlobalFlashcards(shuffled.slice(0, 40));
  };

  // --- Renders ---

  const activeDoc = docs.find((d) => d.id === activeDocId);

  const renderDocItem = (doc: DocumentData) => (
    <div
      key={doc.id}
      className={`relative group ml-2 transition-transform duration-200 ${
        draggingDocId === doc.id ? 'opacity-50 scale-95' : ''
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, doc.id)}
    >
      {editingDocId === doc.id ? (
        <div className="px-2 py-2 flex items-center bg-indigo-50 rounded-md">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename();
              if (e.key === 'Escape') setEditingDocId(null);
            }}
            autoFocus
            className="w-full text-sm bg-white border border-indigo-200 rounded px-2 py-1 outline-none text-gray-700"
          />
          <button onClick={saveRename} className="ml-2 text-green-600">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setActiveDocId(doc.id);
            setSidebarView(SidebarView.MY_DOCS);
            setShowMobileDocs(false);
          }}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center pr-16 cursor-grab active:cursor-grabbing ${
            activeDocId === doc.id && sidebarView === SidebarView.MY_DOCS
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <div className="truncate flex flex-col items-start">
            <span>{doc.name}</span>
            {doc.content?.subject && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
                {doc.content.subject}
              </span>
            )}
          </div>
          {doc.isLoading && (
            <span className="ml-auto w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          )}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-inherit">
            <span
              onClick={(e) => startRenaming(e, doc)}
              className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setDeletingDocId(doc.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </span>
          </div>
        </button>
      )}
    </div>
  );

  const SidebarContent = () => (
    <div
      className={`flex-1 overflow-y-auto px-2 space-y-1 transition-colors duration-200 ${
        draggingDocId ? 'bg-gray-50' : ''
      } scrollbar-hide`}
      onDragOver={onDragOver}
      onDrop={onDropOnRoot}
    >
      {/* Navigation Section */}
      <div className="mb-6 space-y-1">
        <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Navegação
        </h3>
        <button
          onClick={() => setSidebarView(SidebarView.MY_DOCS)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${
            sidebarView === SidebarView.MY_DOCS
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Meus Arquivos
        </button>
        <button
          onClick={handleOpenGlobalQuiz}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${
            sidebarView === SidebarView.GLOBAL_QUIZ
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Banco de Questões
          {user?.role !== 'admin' && !user?.hasPaid && (
            <svg
              className="w-3 h-3 ml-auto text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        <button
          onClick={handleOpenGlobalFlashcards}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${
            sidebarView === SidebarView.GLOBAL_FLASHCARDS
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Banco de Flashcards
          {user?.role !== 'admin' && !user?.hasPaid && (
            <svg
              className="w-3 h-3 ml-auto text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Meus Documentos
      </h3>

      {isCreatingFolder && (
        <div className="px-3 py-2 mb-2 bg-indigo-50 rounded flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveNewFolder();
              if (e.key === 'Escape') cancelCreateFolder();
            }}
            onBlur={cancelCreateFolder}
            autoFocus
            placeholder="Nome da pasta"
            className="w-full text-sm bg-transparent border-b border-indigo-300 outline-none text-gray-700"
          />
        </div>
      )}

      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`mb-2 rounded-lg transition-colors duration-200 ${
            dragOverFolderId === folder.id
              ? 'bg-indigo-100 ring-2 ring-indigo-400'
              : ''
          }`}
          onDragOver={onDragOver}
          onDrop={(e) => onDropOnFolder(e, folder.id)}
          onDragEnter={() => onDragEnterFolder(folder.id)}
          onDragLeave={onDragLeaveFolder}
        >
          <div
            onClick={() => toggleFolder(folder.id)}
            className={`px-3 py-2 flex items-center text-sm font-semibold rounded cursor-pointer select-none ${
              dragOverFolderId === folder.id
                ? 'text-indigo-800'
                : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <svg
              className={`w-3 h-3 mr-2 text-gray-400 transition-transform duration-200 ${
                expandedFolderIds.has(folder.id) ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <svg
              className={`w-4 h-4 mr-2 ${
                dragOverFolderId === folder.id
                  ? 'text-indigo-600'
                  : 'text-yellow-500'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="flex-1 truncate">{folder.name}</span>
            <span className="text-xs text-gray-400 ml-2 font-normal">
              {docs.filter((d) => d.folderId === folder.id).length}
            </span>
          </div>
          {expandedFolderIds.has(folder.id) && (
            <div className="pl-2 border-l-2 border-gray-100 ml-3 mt-1 space-y-1">
              {docs.filter((d) => d.folderId === folder.id).map(renderDocItem)}
              {docs.filter((d) => d.folderId === folder.id).length === 0 &&
                !dragOverFolderId && (
                  <p className="text-xs text-gray-400 pl-2 py-1">Pasta vazia</p>
                )}
            </div>
          )}
        </div>
      ))}
      <div className="mt-2 space-y-1">
        {docs.filter((d) => !d.folderId).map(renderDocItem)}
      </div>
      {docs.length === 0 && folders.length === 0 && !isCreatingFolder && (
        <p className="px-4 text-sm text-gray-400 italic">Nenhum documento.</p>
      )}
    </div>
  );

  const UserProfile = () => (
    <div className="flex items-center space-x-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-gray-700 flex items-center justify-end">
          {user?.username}
          {user?.role === 'admin' ? (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full border border-purple-200">
              Admin
            </span>
          ) : user?.hasPaid ? (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full border border-amber-200">
              Premium
            </span>
          ) : (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full border border-gray-200">
              Free
            </span>
          )}
        </p>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Sair
        </button>
      </div>
      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
        {user?.username.substring(0, 2).toUpperCase()}
      </div>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 flex-col md:flex-row">
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col relative z-20 h-full">
        <div
          className="p-6 border-b border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setSidebarView(SidebarView.MY_DOCS)}
        >
          <Logo className="h-8 text-indigo-600" />
        </div>
        <div className="p-4 space-y-2">
          <label className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md cursor-pointer transition-colors group text-sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Novo PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </label>
          <button
            onClick={handleCreateFolderStart}
            className="flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            Nova Pasta
            {user.role !== 'admin' && !user.hasPaid && (
              <svg
                className="w-3 h-3 ml-2 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            )}
          </button>
        </div>
        {SidebarContent()}
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm z-30 shrink-0">
          <div className="flex items-center overflow-hidden">
            <div
              className="md:hidden mr-4 flex-shrink-0 cursor-pointer"
              onClick={() => setSidebarView(SidebarView.MY_DOCS)}
            >
              <Logo className="h-6 text-indigo-600" />
            </div>
            <div className="hidden md:block text-sm text-gray-500 truncate">
              {sidebarView === SidebarView.GLOBAL_QUIZ ? (
                <span className="font-bold text-purple-700 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>{' '}
                  Banco de Questões Global
                </span>
              ) : sidebarView === SidebarView.GLOBAL_FLASHCARDS ? (
                <span className="font-bold text-green-700 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>{' '}
                  Banco de Flashcards Global
                </span>
              ) : activeDoc && !activeDoc.isLoading && !activeDoc.error ? (
                <>
                  Visualizando:{' '}
                  <span className="font-semibold text-gray-800">
                    {activeDoc.name}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          {UserProfile()}
        </header>

        {/* Local Doc Tabs */}
        {sidebarView === SidebarView.MY_DOCS &&
          activeDoc &&
          !activeDoc.isLoading &&
          !activeDoc.error && (
            <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-center md:justify-start overflow-x-auto no-scrollbar">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg shrink-0">
                {Object.values(Tab).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (
                        tab === Tab.QUIZ &&
                        user.role !== 'admin' &&
                        !user.hasPaid
                      ) {
                        setShowPayment(true);
                        return;
                      }
                      setActiveTab(tab);
                    }}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all flex items-center whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {tab === Tab.QUIZ &&
                      user.role !== 'admin' &&
                      !user.hasPaid && (
                        <svg
                          className="w-3 h-3 ml-2 text-yellow-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                  </button>
                ))}
              </div>
            </div>
          )}

        <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4 md:p-8 relative bg-gray-50">
          {/* Global Views */}
          {sidebarView === SidebarView.GLOBAL_QUIZ ? (
            <div className="max-w-4xl mx-auto">
              {!activeGlobalQuiz ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Banco de Questões Global
                    </h2>
                    <p className="text-gray-500">
                      Pratique com questões geradas por toda a comunidade.
                      Selecione o concurso e a matéria.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 col-span-2 md:col-span-1">
                      <h3 className="font-bold text-indigo-800 text-lg mb-1">
                        1. Tipo de Concurso
                      </h3>
                      <select
                        value={selectedContest}
                        onChange={(e) => setSelectedContest(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                      >
                        <option value="">Selecione um concurso...</option>
                        {Object.keys(CONTEST_STRUCTURE).map((contest) => (
                          <option key={contest} value={contest}>
                            {contest}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 col-span-2 md:col-span-1">
                      <h3 className="font-bold text-purple-800 text-lg mb-1">
                        2. Matéria
                      </h3>
                      <select
                        value={selectedSubject}
                        onChange={(e) =>
                          setSelectedSubject(e.target.value as Subject)
                        }
                        disabled={!selectedContest}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                          {selectedContest
                            ? 'Selecione uma matéria...'
                            : 'Escolha um concurso primeiro'}
                        </option>
                        {selectedContest &&
                          CONTEST_STRUCTURE[selectedContest]?.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-sm text-gray-500 mb-4">
                      {selectedSubject ? (
                        <span>
                          {
                            globalQuestions.filter(
                              (q) => q.subject === selectedSubject,
                            ).length
                          }{' '}
                          questões de <b>{selectedSubject}</b> disponíveis.
                        </span>
                      ) : (
                        <span>
                          Total geral: {globalQuestions.length} questões.
                        </span>
                      )}
                    </div>
                    <button
                      onClick={startGlobalQuiz}
                      disabled={
                        !selectedSubject ||
                        globalQuestions.filter(
                          (q) => q.subject === selectedSubject,
                        ).length === 0
                      }
                      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Iniciar Simulado Rápido (20 Questões)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setActiveGlobalQuiz(null)}
                    className="mb-4 flex items-center text-gray-500 hover:text-indigo-600"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Voltar para Seleção
                  </button>
                  <Quiz questions={activeGlobalQuiz} />
                </div>
              )}
            </div>
          ) : sidebarView === SidebarView.GLOBAL_FLASHCARDS ? (
            <div className="max-w-4xl mx-auto">
              {!activeGlobalFlashcards ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Banco de Flashcards Global
                    </h2>
                    <p className="text-gray-500">
                      Revise conteúdos de toda a comunidade. Selecione o
                      concurso e a matéria.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 col-span-2 md:col-span-1">
                      <h3 className="font-bold text-indigo-800 text-lg mb-1">
                        1. Tipo de Concurso
                      </h3>
                      <select
                        value={selectedContest}
                        onChange={(e) => setSelectedContest(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                      >
                        <option value="">Selecione um concurso...</option>
                        {Object.keys(CONTEST_STRUCTURE).map((contest) => (
                          <option key={contest} value={contest}>
                            {contest}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 col-span-2 md:col-span-1">
                      <h3 className="font-bold text-green-800 text-lg mb-1">
                        2. Matéria
                      </h3>
                      <select
                        value={selectedSubject}
                        onChange={(e) =>
                          setSelectedSubject(e.target.value as Subject)
                        }
                        disabled={!selectedContest}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md border disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                          {selectedContest
                            ? 'Selecione uma matéria...'
                            : 'Escolha um concurso primeiro'}
                        </option>
                        {selectedContest &&
                          CONTEST_STRUCTURE[selectedContest]?.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-sm text-gray-500 mb-4">
                      {selectedSubject ? (
                        <span>
                          {
                            globalFlashcards.filter(
                              (f) => f.subject === selectedSubject,
                            ).length
                          }{' '}
                          flashcards de <b>{selectedSubject}</b> disponíveis.
                        </span>
                      ) : (
                        <span>
                          Total geral: {globalFlashcards.length} flashcards.
                        </span>
                      )}
                    </div>
                    <button
                      onClick={startGlobalFlashcards}
                      disabled={
                        !selectedSubject ||
                        globalFlashcards.filter(
                          (f) => f.subject === selectedSubject,
                        ).length === 0
                      }
                      className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Iniciar Revisão Rápida (40 Cards)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setActiveGlobalFlashcards(null)}
                    className="mb-4 flex items-center text-gray-500 hover:text-green-600"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Voltar para Seleção
                  </button>
                  <Flashcards cards={activeGlobalFlashcards} />
                </div>
              )}
            </div>
          ) : (
            // Local Docs View
            <>
              {!activeDoc ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <svg
                    className="w-16 h-16 md:w-20 md:h-20 mb-4 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-base md:text-lg font-medium">
                    Adicione um PDF para começar.
                  </p>
                </div>
              ) : activeDoc.isLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                    A IA está estudando...
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm">
                    Gerando materiais de estudo.
                  </p>
                </div>
              ) : activeDoc.error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 p-4 text-center">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>{activeDoc.error}</p>
                </div>
              ) : activeDoc.content ? (
                <div className="max-w-7xl mx-auto h-full">
                  {activeTab === Tab.FLASHCARDS && (
                    <Flashcards cards={activeDoc.content.flashcards} />
                  )}
                  {activeTab === Tab.MINDMAP && (
                    <MindMap data={activeDoc.content.mindMap} />
                  )}
                  {activeTab === Tab.QUIZ && (
                    <Quiz questions={activeDoc.content.quiz} />
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setShowMobileDocs(!showMobileDocs)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              showMobileDocs ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
          <label className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-indigo-600 cursor-pointer">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-[10px] font-medium">Add PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </label>
        </div>

        {showMobileDocs && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileDocs(false)}
            ></div>
            <div className="absolute bottom-16 left-0 w-full h-[70vh] bg-white rounded-t-2xl shadow-xl flex flex-col animate-slide-up">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="font-bold text-gray-700">
                  Navegação e Documentos
                </h3>
                <button
                  onClick={() => setShowMobileDocs(false)}
                  className="p-1 bg-white rounded-full text-gray-500 shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {SidebarContent()}
              </div>
            </div>
          </div>
        )}
      </main>

      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSimulatePayment={handlePaymentSuccess}
          user={user}
        />
      )}

      {deletingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Excluir Documento?
              </h3>
              <p className="text-gray-500 mb-6">
                Tem certeza que deseja excluir este PDF e todos os materiais
                gerados? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setDeletingDocId(null)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
