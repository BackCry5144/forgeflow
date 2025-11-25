import * as React from "react"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")
  
  return (
    <div 
      className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md bg-white cursor-pointer hover:bg-gray-50"
      onClick={() => context.setOpen(!context.open)}
    >
      {children}
      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export const SelectValue: React.FC<{ placeholder?: string; children?: React.ReactNode }> = ({ placeholder, children }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  
  // If children provided, use it; otherwise show value or placeholder
  if (children) return <>{children}</>
  return <span className={context.value ? "" : "text-gray-500"}>{context.value || placeholder}</span>
}

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  
  if (!context.open) return null
  
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
      {children}
    </div>
  )
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")
  
  const handleClick = () => {
    context.onValueChange(value)
    context.setOpen(false)
  }
  
  return (
    <div 
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${context.value === value ? 'bg-blue-50 text-blue-600' : ''}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
