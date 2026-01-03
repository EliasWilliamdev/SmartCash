
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  DollarSign,
  Plus,
  X,
  MapPin,
  CreditCard,
  MessageSquare,
  Settings2,
  ChevronDown
} from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { Category, Transaction } from '../types';

interface AddTransactionPageProps {
  onBack: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
}

type ExtraField = 'notes' | 'tags' | 'location' | 'payment_method';

const AddTransactionPage: React.FC<AddTransactionPageProps> = ({ onBack, onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>('Outros');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  
  const [activeExtraFields, setActiveExtraFields] = useState<Set<ExtraField>>(new Set());
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);

  const toggleExtraField = (field: ExtraField) => {
    const newFields = new Set(activeExtraFields);
    if (newFields.has(field)) {
      newFields.delete(field);
    } else {
      newFields.add(field);
    }
    setActiveExtraFields(newFields);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rawValue = amount.toString().replace('R$', '').replace(/\s/g, '').replace(',', '.');
    const numericAmount = parseFloat(rawValue);
    
    if (!description.trim()) {
      alert("Por favor, dê uma descrição.");
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Valor inválido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData: Omit<Transaction, 'id'> = {
        description: description.trim(),
        amount: numericAmount,
        date: date || new Date().toISOString().split('T')[0],
        category: type === 'income' ? 'Renda' : category,
        type: type,
        notes: activeExtraFields.has('notes') ? notes.trim() : undefined,
        location: activeExtraFields.has('location') ? location.trim() : undefined,
        payment_method: activeExtraFields.has('payment_method') ? paymentMethod : undefined,
        tags: activeExtraFields.has('tags') && tags.length > 0 ? tags : undefined,
      };

      await onAdd(transactionData);
      onBack(); 
    } catch (error: any) {
      console.error('Erro ao salvar no Supabase:', error);
      alert(error.message || "Erro desconhecido. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-all group px-4 py-2 hover:bg-white rounded-xl font-black disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Cancelar</span>
        </button>
        
        <div className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
          <Settings2 className="w-4 h-4" />
          Escritura em Nuvem
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-400/20 border-2 border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 border-b-2 border-slate-50 bg-slate-50/30">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Registrar Fluxo</h1>
          <p className="text-slate-600 text-lg font-bold italic">Os dados serão salvos no padrão Postgres.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
          {/* Seletor de Tipo */}
          <div className="grid grid-cols-2 gap-5 p-2.5 bg-slate-100 rounded-[28px]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-3 py-5 rounded-[22px] font-black text-xl transition-all duration-300 ${
                type === 'expense' 
                ? 'bg-rose-600 text-white shadow-2xl shadow-rose-200 scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-6 h-6" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-3 py-5 rounded-[22px] font-black text-xl transition-all duration-300 ${
                type === 'income' 
                ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-6 h-6" />
              Receita
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Campo: Descrição */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                <FileText className="w-5 h-5 text-blue-600" />
                Descrição (O que?)
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado..."
                className="w-full px-8 py-6 bg-white border-2 border-slate-300 rounded-[24px] focus:ring-8 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400 font-black text-slate-900 text-xl shadow-sm"
              />
            </div>

            {/* Campo: Valor */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Valor Consolidado
              </label>
              <div className="relative group">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-slate-900 text-2xl group-focus-within:text-blue-600 transition-colors">R$</span>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-20 pr-8 py-6 bg-white border-2 border-slate-300 rounded-[24px] focus:ring-8 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none transition-all font-black text-3xl text-slate-900 shadow-sm"
                />
              </div>
            </div>

            {/* Campo: Categoria */}
            {type === 'expense' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Eixo de Custo
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCategoryGrid(!showCategoryGrid)}
                    className="w-full flex items-center justify-between px-8 py-6 bg-white border-2 border-slate-300 rounded-[24px] focus:ring-8 focus:ring-blue-500/10 hover:border-slate-400 transition-all text-left shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 scale-150">{CATEGORY_ICONS[category]}</span>
                      <span className="font-black text-slate-900 text-xl">{category}</span>
                    </div>
                    <ChevronDown className={`w-8 h-8 text-slate-900 transition-transform ${showCategoryGrid ? 'rotate-180' : ''}`} />
                  </button>

                  {showCategoryGrid && (
                    <div className="absolute top-full left-0 w-full mt-4 bg-white border-2 border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-[32px] p-5 z-50 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setShowCategoryGrid(false);
                          }}
                          className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all ${
                            category === cat 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl' 
                            : 'bg-slate-50 border-slate-100 hover:border-blue-400 text-slate-900'
                          }`}
                        >
                          <span className={category === cat ? 'text-white scale-125' : 'text-blue-600 scale-125'}>
                            {CATEGORY_ICONS[cat]}
                          </span>
                          <span className="text-base font-black uppercase tracking-tight">{cat}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campo: Data */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                <Calendar className="w-5 h-5 text-blue-600" />
                Data da Ocorrência
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-8 py-6 bg-white border-2 border-slate-300 rounded-[24px] focus:ring-8 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none transition-all font-black text-slate-900 text-xl shadow-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Personalização */}
          <div className="pt-10 border-t-4 border-slate-50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Campos Auxiliares</h3>
            <div className="flex flex-wrap gap-5">
              {[
                { id: 'notes', label: 'Observações', icon: MessageSquare },
                { id: 'location', label: 'Localização', icon: MapPin },
                { id: 'payment_method', label: 'Método de Pagto', icon: CreditCard },
                { id: 'tags', label: 'Etiquetas', icon: Plus }
              ].map(field => (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => toggleExtraField(field.id as ExtraField)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                    activeExtraFields.has(field.id as ExtraField) 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' 
                    : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <field.icon className="w-5 h-5" />
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos Dinâmicos */}
          {(activeExtraFields.size > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-900 p-10 rounded-[40px] shadow-2xl">
              {activeExtraFields.has('notes') && (
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <label className="flex items-center justify-between text-xs font-black text-white uppercase tracking-widest">
                    <span>Anotações</span>
                    <button type="button" onClick={() => toggleExtraField('notes')} className="text-rose-400"><X className="w-6 h-6" /></button>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-8 py-6 bg-slate-800 text-white border-2 border-slate-700 rounded-[28px] focus:border-blue-400 focus:outline-none font-bold text-lg resize-none"
                  />
                </div>
              )}

              {activeExtraFields.has('location') && (
                <div className="space-y-4">
                  <label className="flex items-center justify-between text-xs font-black text-white uppercase tracking-widest">
                    <span>Local</span>
                    <button type="button" onClick={() => toggleExtraField('location')} className="text-rose-400"><X className="w-6 h-6" /></button>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-8 py-6 bg-slate-800 text-white border-2 border-slate-700 rounded-[28px] focus:border-blue-400 focus:outline-none font-black text-lg"
                  />
                </div>
              )}

              {activeExtraFields.has('payment_method') && (
                <div className="space-y-4">
                  <label className="flex items-center justify-between text-xs font-black text-white uppercase tracking-widest">
                    <span>Método</span>
                    <button type="button" onClick={() => toggleExtraField('payment_method')} className="text-rose-400"><X className="w-6 h-6" /></button>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-8 py-6 bg-slate-800 text-white border-2 border-slate-700 rounded-[28px] focus:border-blue-400 focus:outline-none font-black text-lg appearance-none cursor-pointer"
                  >
                    <option value="">Escolha...</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Pix">Pix</option>
                  </select>
                </div>
              )}

              {activeExtraFields.has('tags') && (
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <label className="flex items-center justify-between text-xs font-black text-white uppercase tracking-widest">
                    <span>Etiquetas</span>
                    <button type="button" onClick={() => toggleExtraField('tags')} className="text-rose-400"><X className="w-6 h-6" /></button>
                  </label>
                  <div className="space-y-6">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full px-8 py-6 bg-slate-800 text-white border-2 border-slate-700 rounded-[28px] focus:border-blue-400 focus:outline-none font-black text-lg"
                    />
                    <div className="flex flex-wrap gap-3">
                      {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="text-rose-600"><X className="w-5 h-5" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-8 rounded-[40px] font-black text-3xl text-white transition-all shadow-2xl flex items-center justify-center gap-5 disabled:opacity-50 hover:scale-[1.02] ${
                type === 'income' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {isSubmitting ? "Sincronizando..." : "EFETIVAR LANÇAMENTO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionPage;
