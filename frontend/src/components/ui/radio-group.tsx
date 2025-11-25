import * as React from "react"

interface RadioGroupContextValue {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ value, onValueChange, children }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className="space-y-2">{children}</div>
    </RadioGroupContext.Provider>
  )
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id }) => {
  const context = React.useContext(RadioGroupContext)
  if (!context) throw new Error("RadioGroupItem must be used within RadioGroup")
  
  return (
    <input
      type="radio"
      value={value}
      id={id}
      checked={context.value === value}
      onChange={(e) => context.onValueChange(e.target.value)}
      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
    />
  )
}
