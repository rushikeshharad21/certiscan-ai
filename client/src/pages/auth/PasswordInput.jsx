import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function PasswordInput({ label, name, value, onChange, required, minLength }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput