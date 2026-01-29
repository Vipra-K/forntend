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
  Star,
  FileText,
  AlignLeft
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
      className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide flex flex-col items-center bg-gradient-to-br from-slate-50 to-slate-100/50" 
    >
      <div className="w-full max-w-3xl">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="p-8 md:p-12">
            <header className="mb-10 pb-8 border-b border-slate-100">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                  {form.description}
                </p>
              )}
            </header>

            <div className="space-y-6">
              {form.fields.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/20">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-4">
                    <Layers className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Start building your form</p>
                  <p className="text-slate-400 text-xs mt-1">Add fields from the sidebar</p>
                </div>
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={form.fields} 
                  onReorder={handleReorder}
                  className="space-y-4"
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
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all font-bold text-sm flex items-center justify-center space-x-2 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>Add Field</span>
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

  const getFieldIcon = (key: string) => {
    const icons: Record<string, any> = {
      'text': Type,
      'number': Hash,
      'select': ChevronDown,
      'multiselect': ListChecks,
      'date': Calendar,
      'boolean': CheckSquare,
      'email': Mail,
      'url': Link2,
      'phone': Phone,
      'rating': Star,
      'textarea': AlignLeft,
      'file': FileText
    };
    return icons[key] || Type;
  };

  const Icon = getFieldIcon(field.type.key);

  const renderPreview = () => {
    switch (field.type.key) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <div className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-slate-400 text-sm">
            {field.type.key === 'email' ? 'yourname@example.com' : 
             field.type.key === 'url' ? 'https://example.com' : 
             field.type.key === 'phone' ? '+1 (555) 000-0000' : 
             'Type your answer...'}
          </div>
        );
      case 'textarea':
        return (
          <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-400 text-sm">
            Type your answer...
          </div>
        );
      case 'number':
        return (
          <div className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-slate-400 text-sm">
            0
          </div>
        );
      case 'date':
        return (
          <div className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-slate-400 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Select date...
          </div>
        );
      case 'boolean':
        return (
          <div className="flex space-x-2">
            {['Yes', 'No'].map(opt => (
              <div key={opt} className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
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
              <div key={opt.id} className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className={`w-4 h-4 border-2 border-slate-300 ${field.type.key === 'select' ? 'rounded-full' : 'rounded'}`} />
                <span className="text-sm text-slate-700 font-medium">{opt.label}</span>
              </div>
            ))}
            {field.options.length > 3 && (
              <p className="text-xs text-slate-400 font-medium pl-7">
                + {field.options.length - 3} more options
              </p>
            )}
          </div>
        );
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="w-6 h-6 text-slate-300 fill-slate-100" />
            ))}
          </div>
        );
      default:
        return (
          <div className="w-full h-10 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
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
      className={`group bg-white border rounded-xl p-6 cursor-pointer relative transition-all duration-200 ${
        isActive 
          ? 'border-blue-500 shadow-lg shadow-blue-600/10 ring-2 ring-blue-600/10' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing p-2"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {field.type.key}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <h4 className={`text-base font-bold transition-colors ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
          {field.label || 'Untitled Question'}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        
        {field.description && (
          <p className="text-sm text-slate-500 leading-relaxed">
            {field.description}
          </p>
        )}

        <div className="pt-1">
          {renderPreview()}
        </div>
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -left-0.5 top-4 bottom-4 w-1 bg-blue-600 rounded-full"
        />
      )}
    </Reorder.Item>
  );
}
