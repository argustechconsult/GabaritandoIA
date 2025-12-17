
export type Subject = 
  // Básicas Gerais
  | 'Língua Portuguesa' 
  | 'Raciocínio Lógico' 
  | 'Matemática'
  | 'Informática'
  | 'Atualidades'
  | 'Estatística'
  | 'Inglês'
  
  // Direito
  | 'Direito Constitucional' 
  | 'Direito Administrativo' 
  | 'Direito Penal' 
  | 'Direito Processual Penal' 
  | 'Direito Civil'
  | 'Direito Processual Civil'
  | 'Direito do Trabalho'
  | 'Direito Processual do Trabalho'
  | 'Direito Tributário'
  | 'Direito Previdenciário'
  | 'Direito Empresarial'
  | 'Direito Ambiental'
  | 'Direitos Humanos'
  | 'Legislação Penal Especial'
  | 'Legislação Tributária'
  | 'Legislação Educacional'
  | 'Legislação Militar'
  | 'Legislação Ambiental'
  
  // Administração & Gestão
  | 'Administração Geral'
  | 'Administração Pública'
  | 'AFO' // Administração Financeira e Orçamentária
  | 'Gestão de Pessoas'
  | 'Arquivologia'
  | 'Ética no Serviço Público'
  
  // Contabilidade & Economia
  | 'Contabilidade Geral'
  | 'Contabilidade Pública'
  | 'Auditoria'
  | 'Economia'
  | 'Finanças Públicas'
  | 'Matemática Financeira'
  
  // Áreas Específicas
  | 'Criminologia'
  | 'Conhecimentos Bancários'
  | 'Sistema Financeiro Nacional'
  | 'Vendas e Negociação'
  | 'Seguridade Social'
  | 'Políticas Públicas de Saúde'
  | 'SUS'
  | 'Saúde Pública'
  | 'Epidemiologia'
  | 'Educação (LDB, BNCC, Didática)'
  | 'Conhecimentos Militares'
  | 'Regulação e Agências'
  
  // TI
  | 'Tecnologia da Informação' // Geral
  | 'Algoritmos e Programação'
  | 'Banco de Dados'
  | 'Redes de Computadores'
  | 'Segurança da Informação'
  | 'Engenharia de Software'
  
  // Outros
  | 'Física'
  | 'Química'
  | 'História'
  | 'Geografia'
  | 'Filosofia e Sociologia'
  | 'Outros';

export interface Flashcard {
  question: string;
  answer: string;
  subject?: Subject; // Optional for local viewing, required for global DB
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export interface QuizQuestion {
  question: string;
  options: string[]; // Array of 5 strings
  correctAnswerIndex: number; // 0-4
  explanation: string;
  subject?: Subject; // Optional for local viewing, required for global DB
}

export interface Slide {
  title: string;
  bullets: string[];
}

export interface GeneratedContent {
  subject: Subject;
  flashcards: Flashcard[];
  mindMap: MindMapNode;
  quiz: QuizQuestion[];
}

export interface DocumentData {
  id: string;
  folderId?: string | null;
  name: string;
  timestamp: number;
  content: GeneratedContent | null;
  isLoading: boolean;
  error?: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
  hasPaid: boolean;
}
