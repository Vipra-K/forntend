import { 
  Layers, 
  GripVertical, 
  Trash2, 
  Plus,
  Type,
  Hash,
  ChevronDown,
  ListChecks,
  Calendar,
  CheckSquare,
  Mail,
  Link2,
  Phone,
  Star
} from 'lucide-react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { Field, Form, FieldType } from '../types';

interface EditorCanvasProps {
  form: Form;
  activeFieldId: string | null;
  setActiveFieldId: (id: string | null) => void;
  handleReorder: (newFields: Field[]) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addField: (typeId: string) => Promise<void>;
  fieldTypes: FieldType[];
}

export function EditorCanvas({
  form,
  activeFieldId,
  setActiveFieldId,
  handleReorder,
  deleteField,
  addField,
  fieldTypes
}: EditorCanvasProps) {
  return (
    <main 
      className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide flex flex-col items-center bg-slate-50" 
    >
      <div className="w-full max-w-3xl">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-8 md:p-12">
            <header className="mb-12 border-b border-slate-100 pb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3 italic">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
                  {form.description}
                </p>
              )}
            </header>

            <div className="space-y-10">
              {form.fields.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                  <Layers className="w-10 h-10 text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Build your form by adding elements.</p>
                </div>
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={form.fields} 
                  onReorder={handleReorder}
                  className="space-y-6"
                >
                  {form.fields.map((field) => (
                    <FieldItem 
                      key={field.id}
                      field={field}
                      isActive={activeFieldId === field.id}
                      onClick={() => setActiveFieldId(field.id)}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))}
                </Reorder.Group>
              )}
              
              <button 
                onClick={() => addField(fieldTypes[0]?.id)}
                className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>Add Element</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FieldItem({ 
  field, 
  isActive, 
  onClick, 
  onDelete 
}: { 
  field: Field; 
  isActive: boolean; 
  onClick: () => void; 
  onDelete: () => void; 
}) {
  const dragControls = useDragControls();

  const renderPreview = () => {
    switch (field.type.key) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center text-slate-500 text-base shadow-sm">
            {field.type.key === 'email' ? 'yourname@example.com' : 
             field.type.key === 'url' ? 'https://...' : 
             field.type.key === 'phone' ? '+1 (555) 000-0000' : 
             'Type your answer...'}
          </div>
        );
      case 'number':
        return (
          <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center text-slate-500 text-lg font-bold italic shadow-sm">
            0
          </div>
        );
      case 'date':
        return (
          <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center text-slate-500 text-base shadow-sm">
            <Calendar className="w-4 h-4 mr-2 opacity-50" />
            Select date...
          </div>
        );
      case 'boolean':
        return (
          <div className="flex space-x-2">
            {['True', 'False'].map(opt => (
              <div key={opt} className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest shadow-sm">
                {opt}
              </div>
            ))}
          </div>
        );
      case 'select':
      case 'multiselect':
        return (
          <div className="space-y-2">
            {(field.options.length > 0 ? field.options : [{ id: '1', label: 'Option 1' }]).slice(0, 3).map((opt) => (
              <div key={opt.id} className="flex items-center space-x-3 p-4 bg-slate-50/50 border border-slate-100 rounded-xl shadow-sm">
                <div className={`w-5 h-5 border-2 border-slate-200 ${field.type.key === 'select' ? 'rounded-full' : 'rounded-md'}`} />
                <span className="text-base text-slate-700 font-semibold">{opt.label}</span>
              </div>
            ))}
            {field.options.length > 3 && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-7">
                + {field.options.length - 3} more options
              </p>
            )}
          </div>
        );
      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="w-6 h-6 text-slate-200 fill-slate-50" />
            ))}
          </div>
        );
      default:
        return (
          <div className="w-full h-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {field.type.key} input
          </div>
        );
    }
  };

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      onClick={onClick}
      className={`group bg-white border p-7 md:p-8 rounded-[2rem] cursor-pointer relative transition-all duration-300 ${
        isActive 
          ? 'border-blue-500 shadow-[0_20px_40px_-12px_rgba(59,130,246,0.12)] ring-1 ring-blue-500/10 scale-[1.01]' 
          : 'border-slate-200/60 bg-zinc-100/60 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40'
      }`}
    >
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing p-3"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
            {field.type.key === 'text' && <Type className="w-4 h-4" />}
            {field.type.key === 'number' && <Hash className="w-4 h-4" />}
            {field.type.key === 'select' && <ChevronDown className="w-4 h-4" />}
            {field.type.key === 'multiselect' && <ListChecks className="w-4 h-4" />}
            {field.type.key === 'date' && <Calendar className="w-4 h-4" />}
            {field.type.key === 'boolean' && <CheckSquare className="w-4 h-4" />}
            {field.type.key === 'email' && <Mail className="w-4 h-4" />}
            {field.type.key === 'url' && <Link2 className="w-4 h-4" />}
            {field.type.key === 'phone' && <Phone className="w-4 h-4" />}
            {field.type.key === 'rating' && <Star className="w-4 h-4" />}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            {field.type.key} Field
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <h4 className={`text-lg font-bold tracking-tight transition-colors ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
          {field.label || 'Untitled Question'}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </h4>
        
        {field.description && (
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
            {field.description}
          </p>
        )}

        <div className="pt-2">
          {renderPreview()}
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -left-1 top-8 bottom-8 w-1 bg-blue-600 rounded-full"
        />
      )}
    </Reorder.Item>
  );
}
