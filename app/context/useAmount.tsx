'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { toast } from 'sonner'

// Define the shape of the context
interface AmountContextType {
  amount: number
  updateExchangeRate: (amount: number) => Promise<void>
  setAmount?: (amount: number) => void // Optional if you want to expose it
}

// Create the context with an initial value
export const AmountContext = createContext<AmountContextType>({
  amount: 0,
  updateExchangeRate: async () => {}
})

// Custom hook to consume the context
export const useAmount = () => useContext(AmountContext)

// Provider component
export const AmountProvider = ({ children }: { children: ReactNode }) => {
  const [amount, setAmount] = useState<number>(0)

  const createTable = async (): Promise<void> => {
    await window.electronAPI
      .dbQuery(
        `
            CREATE TABLE IF NOT EXISTS exchange_rate (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              amount REAL NOT NULL DEFAULT 0.0
            );
            
          `,
        []
      )
      .then(() => {
        console.log('Table created successfully')
      })
      .catch(error => {
        console.error('Failed to create table:', error)
      })
  }

  useEffect(() => {
    createTable()
  }, [])

  // Function to fetch the exchange rate
  const fetchExchangeRate = async (): Promise<void> => {
    try {
      const query = `SELECT amount FROM exchange_rate WHERE id = 1`
      const result = await window.electronAPI.dbQuery(query, [])
      if (result?.length > 0) {
        setAmount(result[0].amount)
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
    }
  }

  // Function to update the exchange rate
  const updateExchangeRate = async (newAmount: number): Promise<void> => {
    console.log('Updating exchange rate:', newAmount)
    try {
      const query = `
        INSERT INTO exchange_rate (id, amount)
VALUES (?, ?)
ON CONFLICT(id) DO UPDATE SET amount = excluded.amount;

      `
      const result = await window.electronAPI.dbQuery(query, [1, newAmount])

      if (result?.success) {
        setAmount(newAmount)
        toast.success('تم تحديث سعر الصرف بنجاح')
      }
    } catch (error) {
      console.error('Failed to update exchange rate:', error)
    }
  }

  // Fetch exchange rate on component mount
  useEffect(() => {
    fetchExchangeRate()
  }, [])

  // Provide the context value
  return (
    <AmountContext.Provider value={{ amount, updateExchangeRate }}>
      {children}
    </AmountContext.Provider>
  )
}
