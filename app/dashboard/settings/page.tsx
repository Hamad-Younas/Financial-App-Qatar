'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import TopHeader from '@/components/ui/topHeader'
import { EditIcon } from 'lucide-react'
import { useAmount } from '@/app/context/useAmount'
import { Label } from '@radix-ui/react-label'
import { DataTable } from '@/components/ui/responsiveTable'

interface Account {
  id: number
  accountNumber: string
  accountName: string
  amount: number
}

interface Bank {
  id: number
  bankName: string
}

export default function SettingsPage () {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [backupFile, setBackupFile] = useState(null);
  const [budgets, setBudgets] = useState([])
  const [rows,setRows]=useState(0);
  const [newAccount, setNewAccount] = useState({
    id: '',
    name: '',
    amount: 0,
    category:''
  })
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNo: '',
    currency: '',
    officeName: '',
    type:''
  });
  const [newUser,setNewUser]=useState({
    username:'',
    role:'',
    password:''
  })
  const [yearBudget,setYearBudget]=useState({
    year: 0,
    budget: 0,
    gift: 0
  })
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [editingUser, setEditingUser] = useState<Bank | null>(null)
  const [editingBudget, setEditingBudget] = useState<Bank | null>(null)
  const { amount, updateExchangeRate } = useAmount()
  const [exchangeRate, setExchangeRate] = useState(amount)
  const [users,setUsers]=useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setExchangeRate(amount)
  }, [amount])

  // Fetch data on component mount
  const createTables = async () => {
    try {
      // Create accounts table

      // Create banks table
      await window.electronAPI.dbQuery(
        `
        CREATE TABLE IF NOT EXISTS banks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bank_name TEXT NOT NULL
        )
      `,
        []
      )

      console.log('Tables created successfully')
    } catch (error) {
      console.error('Error creating tables:', error)
    }
  }

  const fetchRows = async () => {
    try {
      const query = 'SELECT rows FROM ReportRows Where Id=1'
      const result = await window.electronAPI.dbQuery(query)
      setRows(result[0].rows);
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to fetch accounts')
    }
  }


  const fetchAccounts = async () => {
    try {
      const query = 'SELECT account_types.*, categories.name AS category_name FROM account_types LEFT JOIN categories ON categories.id = account_types.category_id'
      const result = await window.electronAPI.dbQuery(query, [])
      setAccounts(
        result.map((account: any) => ({
          id: account.id,
          accountNumber: account.id,
          accountName: account.name,
          category: account.category_name,
          amount: account.amount
        }))
      )
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to fetch accounts')
    }
  }

  const fetchBudget = async () => {
    try {
      const query = 'SELECT * FROM yearlybudget'
      const result = await window.electronAPI.dbQuery(query, [])
      setBudgets(
        result.map((budget: any) => ({
          id: budget.id,
          year: budget.year,
          budget: budget.budget,
          gift: budget.gift
        }))
      )
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to fetch budgets')
    }
  }

  const fetchUsers = async () => {
    try {
      const query = 'SELECT * FROM users'
      const result = await window.electronAPI.dbQuery(query, [])
      setUsers(
        result.map((account: any) => ({
          id: account.id,
          username: account.name,
          role: account.role,
        }))
      )
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to fetch accounts')
    }
  }

  const fetchBanks = async () => {
    try {
      const query = 'SELECT * FROM banks'
      const result = await window.electronAPI.dbQuery(query, [])
      
      setBanks(
        result.map((bank: any) => ({
          id: bank.id,
          bankName: bank.bank_name,
          accountNo: bank.account_no,
          currency: bank.currency,
          officeName: bank.office_name,
          type: bank.type
        }))
      )
    } catch (error) {
      console.error('Error fetching banks:', error)
      toast.error('Failed to fetch banks')
    }
  }  

  useEffect(() => {
    fetchAccounts()
    fetchBanks()
    createTables()
    fetchUsers()
    fetchRows();
    fetchBudget();
  }, [])

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log(newAccount,editingAccount);
      const categoryId=parseInt(newAccount.category);
      if (editingAccount) {
        const query =
          'UPDATE account_types SET id = ?, name = ?, amount = ?, category_id= ?  WHERE id = ?'
        await window.electronAPI.dbQuery(query, [
          newAccount.id,
          newAccount.name,
          newAccount.amount,
          categoryId,
          editingAccount.id
        ])
        toast.success('Account updated successfully')
      } else {
        const query =
          'INSERT INTO account_types (id, name, amount, category_id) VALUES (?, ?, ?, ?)';
        const response=await window.electronAPI.dbQuery(query, [
          newAccount.id || null, 
          newAccount.name || 'Unnamed',
          newAccount.amount || 0,
          categoryId || null, 
        ]);
        console.log(response);
        toast.success('Account added successfully')
      }
      setIsAccountModalOpen(false)
      setNewAccount({ id: '', name: '', amount: 0, category: '' })
      setEditingAccount(null)
      fetchAccounts()
    } catch (error) {
      console.error('Error saving account:', error)
      toast.error('Failed to save account')
    }
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const query =
          'UPDATE users SET  name = ?, role = ? WHERE id = ?'
        await window.electronAPI.dbQuery(query, [
          newUser.username,
          newUser.role,
          editingUser.id
        ])
        toast.success('Account updated successfully')
      } else {
        const query = 'INSERT INTO users (name, role, password) VALUES (?, ?, ?)';
        console.log('Executing query:', query);
        console.log('Parameters:', [newUser.username, newUser.role, newUser.password]);

        try {
          const response = await window.electronAPI.dbQuery(query, [
            newUser.username,
            newUser.role,
            newUser.password,
          ]);
          console.log('Database response:', response);
          toast.success('Account added successfully');
        } catch (error) {
          console.error('Error saving account:', error);
          toast.error('Failed to save account');
        }
        toast.success('Account added successfully')
      }
      setIsUserModalOpen(false)
      setNewUser({ username: '', role: '', password: '' })
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error saving account:', error)
      toast.error('Failed to save account')
    }
  }

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBudget) {
        const query =
          'UPDATE yearlybudget SET  year = ?, budget = ?, gift = ? WHERE id = ?'
          await window.electronAPI.dbQuery(query, [
            yearBudget.year,
            yearBudget.budget,
            yearBudget.gift,
            editingBudget.id
          ])
          toast.success('Budget updated successfully')
      } else {
        const query = 'INSERT INTO yearlybudget (year, budget, gift) VALUES (?, ?, ?)';

        try {
          const response = await window.electronAPI.dbQuery(query, [
            yearBudget.year,
            yearBudget.budget,
            yearBudget.gift,
          ]);
          console.log('Database response:', response);
          toast.success('Account added successfully');
        } catch (error) {
          console.error('Error saving account:', error);
          toast.error('Failed to save account');
        }
        toast.success('Budget added successfully')
      }
      setIsGiftModalOpen(false)
      setYearBudget({ year: 0, budget: 0, gift: 0 })
      setEditingBudget(null)
      fetchBudget()
    } catch (error) {
      console.error('Error saving account:', error)
      toast.error('Failed to save account')
    }
  }

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        const query = 'UPDATE banks SET bank_name = ?, account_no = ?, currency = ?, office_name = ?, type=? WHERE id = ?';
        await window.electronAPI.dbQuery(query, [
          newBank.bankName,
          newBank.accountNo,
          newBank.currency,
          newBank.officeName,
          newBank.type,
          editingBank.id
        ]);
        toast.success('Bank updated successfully');
      } else {
        const query = 'INSERT INTO banks (bank_name, account_no, currency, office_name, type) VALUES (?, ?, ?, ?, ?)';
        await window.electronAPI.dbQuery(query, [
          newBank.bankName,
          newBank.accountNo,
          newBank.currency,
          newBank.officeName,
          newBank.type
        ]);
        toast.success('Bank added successfully');
      }
      setIsBankModalOpen(false);
      setNewBank({ bankName: '', accountNo: '', currency: '', officeName: '' });
      setEditingBank(null);
      fetchBanks();
    } catch (error) {
      console.error('Error saving bank:', error);
      toast.error('Failed to save bank');
    }
  };  

  const handleDeleteAccount = async (id: number) => {
    try {
      const confirm = window.confirm(
        'Are you sure you want to delete this account?'
      )
      if (!confirm) return

      const query = 'DELETE FROM account_types WHERE id = ?'
      await window.electronAPI.dbQuery(query, [id])
      toast.success('Account deleted successfully')
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  const handleDeleteBudget = async (id: number) => {
    try {
      const confirm = window.confirm(
        'Are you sure you want to delete this budget?'
      )
      if (!confirm) return

      const query = 'DELETE FROM yearlybudget WHERE id = ?'
      await window.electronAPI.dbQuery(query, [id])
      toast.success('Budget deleted successfully')
      fetchBudget()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      const confirm = window.confirm(
        'Are you sure you want to delete this user?'
      )
      if (!confirm) return

      const query = 'DELETE FROM users WHERE id = ?'
      await window.electronAPI.dbQuery(query, [id])
      toast.success('User deleted successfully')
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  const handleDeleteBank = async (id: number) => {
    try {
      const confirm = window.confirm(
        'Are you sure you want to delete this bank?'
      )
      if (!confirm) return
      const query = 'DELETE FROM banks WHERE id = ?'
      await window.electronAPI.dbQuery(query, [id])
      toast.success('Bank deleted successfully')
      fetchBanks()
    } catch (error) {
      console.error('Error deleting bank:', error)
      toast.error('Failed to delete bank')
    }
  }

  const updateRows=async (rows: Number)=>{
    try{
      const query = 'UPDATE ReportRows SET rows=? WHERE id = 1'
      await window.electronAPI.dbQuery(query,[rows])
      toast.success('Rows Updated Succesfully');
    }
    catch{
      console.log('error while updating rows');
    }
  }

  const backup = async () => {
    const result = await window.electronAPI.backup('backup');
    if (result.success) {
      toast.success('Backup Created successfully');
      console.log('Backup created at:', result.backupPath);
    } else {
      console.error('Backup failed:', result.error);
    }
  };

  const handleBackupSubmit = async (e) => {
    e.preventDefault();
  
    console.log(backupFile);
    const filename=backupFile.name;
    try {
      const result = await window.electronAPI.restoreBackup({filename});
      if (result.success) {
        toast.success('تم استعادة النسخة الاحتياطية بنجاح.');
      } else {
        toast.error('فشل في الاستعادة: ' + result.error);
      }
    } catch (error) {
      console.error('خطأ أثناء الاستعادة:', error);
      toast.error('حدث خطأ أثناء استعادة النسخة الاحتياطية.');
    }
  };

  const handleRowsPerPageChange = (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setCurrentPage(1); // Reset to first page
    };
  
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };
  
    const accountPaginatedData = () => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return accounts.slice(startIndex, endIndex);
    };

    const userspaginatedData = () => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return users.slice(startIndex, endIndex);
    };

    const bankspaginatedData = () => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return banks.slice(startIndex, endIndex);
    };

    const budgetPaginatedData = () => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return budgets.slice(startIndex, endIndex);
    };
  
    const bankPages = Math.ceil(banks.length / rowsPerPage);
    const userPages = Math.ceil(users.length / rowsPerPage);
    const accountPages = Math.ceil(accounts.length / rowsPerPage);
    const budgetPages = Math.ceil(budgets.length / rowsPerPage);

  const columns: ColumnDef<Bank>[] = [
    {
      accessorKey: 'actions',
      header: 'فعل',
      cell: ({ row }) => {
        const bank = row.original;
        return (
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setEditingBank(bank);
                setNewBank(bank);
                setIsBankModalOpen(true);
              }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M5 20H19C19.2652 20 19.5196 20.1054 19.7071 20.2929C19.8946 20.4804 20 20.7348 20 21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21C4 20.7348 4.10536 20.4804 4.29289 20.2929C4.48043 20.1054 4.73478 20 5 20ZM4 15L14 5L17 8L7 18H4V15ZM15 4L17 2L20 5L17.999 7.001L15 4Z'
                  fill='black'
                />
              </svg>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDeleteBank(bank.id)}
            >
              <svg
                width='18'
                height='23'
                viewBox='0 0 18 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M13.7549 7.5V20H3.75494V7.5H13.7549ZM11.8799 0H5.62994L4.37994 1.25H0.00494385V3.75H17.5049V1.25H13.1299L11.8799 0ZM16.2549 5H1.25494V20C1.25494 21.375 2.37994 22.5 3.75494 22.5H13.7549C15.1299 22.5 16.2549 21.375 16.2549 20V5Z'
                  fill='black'
                />
              </svg>
            </Button>
          </div>
        );
      }
    },
    {
      accessorKey: 'type',
      header: 'نوع البنك'
    },
    {
      accessorKey: 'bankName',
      header: 'اسم البنك'
    },
    {
      accessorKey: 'accountNo',
      header: 'رقم الحساب'
    },
    {
      accessorKey: 'currency',
      header: 'العملة'
    },
    {
      accessorKey: 'officeName',
      header: 'اسم المكتب'
    },
    {
      accessorKey: 'id',
      header: 'الرقم التسلسلي',
      cell: ({ row }) => row.index + 1
    }
  ];
  
  const columns1: ColumnDef<Account>[] = [
    {
      accessorKey: 'actions',
      header: 'فعل',
      cell: ({ row }) => {
        const account = row.original
        return (
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setEditingAccount(account)
                setNewAccount(account)
                setIsAccountModalOpen(true)
              }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M5 20H19C19.2652 20 19.5196 20.1054 19.7071 20.2929C19.8946 20.4804 20 20.7348 20 21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21C4 20.7348 4.10536 20.4804 4.29289 20.2929C4.48043 20.1054 4.73478 20 5 20ZM4 15L14 5L17 8L7 18H4V15ZM15 4L17 2L20 5L17.999 7.001L15 4Z'
                  fill='black'
                />
              </svg>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDeleteAccount(account.id)}
            >
              <svg
                width='18'
                height='23'
                viewBox='0 0 18 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M13.7549 7.5V20H3.75494V7.5H13.7549ZM11.8799 0H5.62994L4.37994 1.25H0.00494385V3.75H17.5049V1.25H13.1299L11.8799 0ZM16.2549 5H1.25494V20C1.25494 21.375 2.37994 22.5 3.75494 22.5H13.7549C15.1299 22.5 16.2549 21.375 16.2549 20V5Z'
                  fill='black'
                />
              </svg>
            </Button>
          </div>
        )
      }
    },
    {
      accessorKey: 'amount',
      header: 'ميزانية (USD)'
    },
    {
      accessorKey: 'accountName',
      header: 'اسم البند'
    },
    {
      accessorKey: 'category',
      header: 'فئة'
    },
    {
      accessorKey: 'accountNumber',
      header: 'رقم البند'
    },
    {
      accessorKey: 'id',
      header: 'الرقم التسلسلي',
      cell: ({ row }) => row.index + 1
    }
  ]

  const budgetCols: ColumnDef<Account>[] = [
    {
      accessorKey: 'actions',
      header: 'فعل',
      cell: ({ row }) => {
        const account = row.original
        return (
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setEditingBudget(account)
                setYearBudget(account)
                setIsGiftModalOpen(true)
              }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M5 20H19C19.2652 20 19.5196 20.1054 19.7071 20.2929C19.8946 20.4804 20 20.7348 20 21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21C4 20.7348 4.10536 20.4804 4.29289 20.2929C4.48043 20.1054 4.73478 20 5 20ZM4 15L14 5L17 8L7 18H4V15ZM15 4L17 2L20 5L17.999 7.001L15 4Z'
                  fill='black'
                />
              </svg>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDeleteBudget(account.id)}
            >
              <svg
                width='18'
                height='23'
                viewBox='0 0 18 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M13.7549 7.5V20H3.75494V7.5H13.7549ZM11.8799 0H5.62994L4.37994 1.25H0.00494385V3.75H17.5049V1.25H13.1299L11.8799 0ZM16.2549 5H1.25494V20C1.25494 21.375 2.37994 22.5 3.75494 22.5H13.7549C15.1299 22.5 16.2549 21.375 16.2549 20V5Z'
                  fill='black'
                />
              </svg>
            </Button>
          </div>
        )
      }
    },
    {
      accessorKey: 'year',
      header: 'السنة'
    },
    {
      accessorKey: 'budget',
      header: 'الميزانية'
    },
    {
      accessorKey: 'gift',
      header: 'الهدية'
    },
    {
      accessorKey: 'id',
      header: 'الرقم التسلسلي',
      cell: ({ row }) => row.index + 1
    }
  ]

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'actions',
      header: 'فعل',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setEditingUser(user);
                setNewUser(user);
                setIsUserModalOpen(true);
              }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M5 20H19C19.2652 20 19.5196 20.1054 19.7071 20.2929C19.8946 20.4804 20 20.7348 20 21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21C4 20.7348 4.10536 20.4804 4.29289 20.2929C4.48043 20.1054 4.73478 20 5 20ZM4 15L14 5L17 8L7 18H4V15ZM15 4L17 2L20 5L17.999 7.001L15 4Z'
                  fill='black'
                />
              </svg>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDeleteUser(user.id)}
            >
              <svg
                width='18'
                height='23'
                viewBox='0 0 18 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M13.7549 7.5V20H3.75494V7.5H13.7549ZM11.8799 0H5.62994L4.37994 1.25H0.00494385V3.75H17.5049V1.25H13.1299L11.8799 0ZM16.2549 5H1.25494V20C1.25494 21.375 2.37994 22.5 3.75494 22.5H13.7549C15.1299 22.5 16.2549 21.375 16.2549 20V5Z'
                  fill='black'
                />
              </svg>
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'username',
      header: 'اسم المستخدم',
    },
    {
      accessorKey: 'role',
      header: 'الدور',
      cell: ({ row }) => {
        const roles = {
          admin: 'مسؤول',
          moderator: 'مشرف',
          viewer: 'مشاهد',
        };
        return roles[row.original.role] || 'غير معروف';
      },      
    },
    {
      accessorKey: 'id',
      header: 'الرقم التسلسلي',
      cell: ({ row }) => row.index + 1,
    },
  ];  

  return (
    <div className='container mx-auto py-10 ' dir='rtl'>
      <TopHeader />
      <Tabs defaultValue='accounts' className='w-full min-h-[26rem]'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='accounts' className='font-bold text-xl'>
            الحسابات
          </TabsTrigger>
          <TabsTrigger value='banks' className='font-bold text-xl'>
            البنوك
          </TabsTrigger>
          <TabsTrigger value='exchange_rate' className='font-bold text-xl'>
          الإعدادات العامة
          </TabsTrigger>
          <TabsTrigger value='users' className='font-bold text-xl'>
          إضافة مستخدم  
          </TabsTrigger>
          <TabsTrigger value='backup' className='font-bold text-xl'>
          النسخ والاسترجاع  
          </TabsTrigger>
        </TabsList>

        <TabsContent value='accounts'>
          <div className='flex justify-start items-center my-4'>
            <Dialog
              open={isAccountModalOpen}
              onOpenChange={setIsAccountModalOpen}
            >
              <DialogTrigger asChild>
              <div className="flex justify-end w-full">
                <Button
                  variant="default"
                  className="bg-[#800020] text-xl font-bold w-[200px] h-[60px] -mb-12"
                >
                  إضافة حساب
                </Button>
              </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-3xl mt-5 font-bold text-right block rtl'>
                    {editingAccount ? 'تعديل حساب' : 'إضافة حساب'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAccountSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-xl font-bold text-right block rtl'>رقم الحساب</label>
                    <Input
                      required
                      type="number"
                      value={newAccount.id}
                      onChange={e =>
                        setNewAccount({
                          ...newAccount,
                          id: e.target.value
                        })
                      }
                      className='text-right'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xl font-bold text-right block rtl'>اسم الحساب</label>
                    <Input
                      required
                      value={newAccount.name}
                      onChange={e =>
                        setNewAccount({
                          ...newAccount,
                          name: e.target.value
                        })
                      }
                      className='text-right'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xl font-bold text-right block rtl'>المبلغ (USD)</label>
                    <Input
                      type='number'
                      required
                      value={newAccount.amount}
                      onChange={e =>
                        setNewAccount({
                          ...newAccount,
                          amount: parseFloat(e.target.value)
                        })
                      }
                      className='text-right'
                    />
                  </div>

                <div className="space-y-2">
                  <label className="text-xl font-bold text-right block rtl">فئة</label>
                  <select
                    required
                    value={newAccount.category}
                    dir="rtl"
                    onChange={e => setNewAccount({ ...newAccount, category: e.target.value })}
                    className="w-full p-2 border border-[#942c51] rounded-md focus:outline-none focus:ring-2 focus:ring-[#942c51]"
                  >
                    <option value="" selected>
                      اختر الفئة
                    </option>
                    <option value="1">الموارد البشرية</option>
                    <option value="2">النفقات الحالية</option>
                    <option value="3">الأصول</option>
                  </select>
                </div>
                  <Button
                    type='submit'
                    className='w-full bg-[#800020] text-xl font-bold'
                  >
                    {editingAccount ? 'تحديث' : 'حفظ'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable columns={columns1} data={accountPaginatedData()} />

          <div className="flex justify-between mt-4">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center">
              <label className="mr-2">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex space-x-2">
              {Array.from({ length: accountPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === index + 1
                      ? "bg-[#942c51] text-white"
                      : "bg-[#e1a3b1] text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='users'>
          <div className='flex justify-start items-center my-4'>
          <Dialog
            open={isUserModalOpen}
            onOpenChange={setIsUserModalOpen}
          >
            <DialogTrigger asChild>
            <div className="flex justify-end w-full">
              <Button
                variant='default'
                className='bg-[#800020] text-xl font-bold w-[200px] h-[60px] -mb-12'
              >
                إضافة مستخدم
              </Button>
            </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className='text-3xl mt-5 font-bold text-right block rtl'>
                  {editingAccount ? 'تعديل مستخدم' : 'إضافة مستخدم'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUserSubmit} className='space-y-4'>
              <div className='space-y-2'>
                  <label className='text-xl font-bold text-right block rtl'>اسم المستخدم</label>
                  <Input
                    required
                    value={newUser.username}
                    onChange={e =>
                      setNewUser({
                        ...newUser,
                        username: e.target.value
                      })
                    }
                    className='text-right'
                  />
                </div>
                <div className='space-y-2'>
                <label className='text-xl font-bold text-right block rtl'>الدور</label>
                  <select
                    required
                    value={newUser.role}
                    onChange={e =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value
                      })
                    }
                    className='w-full p-2 border rounded text-right'
                  >
                    <option value="" disabled>اختر الدور</option>
                    <option value="admin">(Admin) مسؤول</option>
                    <option value="moderator">(Moderator) مشرف</option>
                    <option value="viewer">(Viewer) مشاهد</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='text-xl font-bold text-right block rtl'>كلمة المرور</label>
                  <Input
                    type="password"
                    required={!editingUser}
                    value={newUser.password}
                    onChange={e =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value
                      })
                    }
                    className="text-right"
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full bg-[#800020] text-xl font-bold'
                >
                  {editingAccount ? 'تحديث' : 'حفظ'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          </div>
          <DataTable columns={userColumns} data={userspaginatedData()} />

          <div className="flex justify-between mt-4">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center">
              <label className="mr-2">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex space-x-2">
              {Array.from({ length: userPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === index + 1
                      ? "bg-[#942c51] text-white"
                      : "bg-[#e1a3b1] text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>


        <TabsContent value='banks'>
          <div className='flex justify-start items-center my-4'>
            <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
              <DialogTrigger asChild>
              <div className="flex justify-end w-full">
                <Button
                  variant='default'
                  className='bg-[#800020] text-xl font-bold w-[200px] h-[60px] -mb-12'
                >
                  إضافة بنك
                </Button>
              </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-3xl mt-5 font-bold text-right block rtl'>
                    {editingBank ? 'تعديل بنك' : 'إضافة بنك'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBankSubmit} className='space-y-4'>
                <div className="space-y-2">
                  <label className="text-xl font-bold text-right block rtl">اسم البنك</label>
                  <Input
                    required
                    value={newBank.bankName}
                    onChange={e =>
                      setNewBank({ ...newBank, bankName: e.target.value })
                    }
                    className='text-right'
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xl font-bold text-right block rtl">رقم الحساب</label>
                  <Input
                    required
                    value={newBank.accountNo}
                    onChange={e =>
                      setNewBank({ ...newBank, accountNo: e.target.value })
                    }
                    className='text-right'
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xl font-bold text-right block rtl">العملة</label>
                  <select
                    required
                    value={newBank.currency}
                    onChange={e => setNewBank({ ...newBank, currency: e.target.value })}
                    className="w-full p-2 border border-[#942c51] rounded-md focus:outline-none focus:ring-2 focus:ring-[#942c51]"
                  >
                    <option value="USD">USD</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-bold text-right block rtl">اسم المكتب</label>
                  <Input
                    required
                    value={newBank.officeName}
                    onChange={e =>
                      setNewBank({ ...newBank, officeName: e.target.value })
                    }
                    className='text-right'
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-bold text-right block rtl">نوع البنك</label>
                  <select
                    required
                    value={newBank.type}
                    onChange={e => setNewBank({ ...newBank, type: e.target.value })}
                    dir="rtl"
                    className="w-full p-2 border border-[#942c51] rounded-md focus:outline-none focus:ring-2 focus:ring-[#942c51]"
                  >
                    <option value="" selected>اختر النوع</option>
                    <option value="أولي">أولي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>
                  <Button
                    type='submit'
                    className='w-full bg-[#800020] text-xl font-bold'
                  >
                    {editingBank ? 'تحديث' : 'حفظ'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable columns={columns} data={bankspaginatedData()} />
          <div className="flex justify-between mt-4">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center">
              <label className="mr-2">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex space-x-2">
              {Array.from({ length: bankPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === index + 1
                      ? "bg-[#942c51] text-white"
                      : "bg-[#e1a3b1] text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value='exchange_rate'>
          <div className='flex justify-between items-center my-8'> 
            <div className='flex items-center gap-5'>
              
              <Button
                variant='default'
                className='bg-[#800020] text-xl font-bold w-[270px] h-[65px]'
                onClick={() => updateExchangeRate(exchangeRate)}
              >
                تحديث
              </Button>
              <Input
                type='number'
                value={exchangeRate}
                className=' border rounded-md w-[270px] h-[65px] border-black text-center'
                onChange={e => setExchangeRate(parseFloat(e.target.value))}
              />
            </div>
            <Label className='text-xl font-bold' style={{ color: '#800020' }}>
              سعر الدولار
            </Label>
          </div>
          <hr style={{width:"100%"}}/>
          <div className='flex justify-between items-center my-8'> 
            <div className='flex items-center gap-5'>
              
              <Button
                variant='default'
                className='bg-[#800020] text-xl font-bold w-[270px] h-[65px]'
                onClick={() => updateRows(rows)}
              >
                تحديث
              </Button>
              <Input
                type='number'
                value={rows}
                className=' border rounded-md w-[270px] h-[65px] border-black text-center'
                onChange={e => setRows(parseFloat(e.target.value))}
              />
            </div>
            <Label className='text-xl font-bold' style={{ color: '#800020' }}>
            لصفوف التقرير عبر الإنترنت
            </Label>
          </div>
          <hr style={{width:"100%"}}/>

          <div className='flex justify-start items-center my-4'>
          <Dialog
            open={isGiftModalOpen}
            onOpenChange={setIsGiftModalOpen}
          >
            <DialogTrigger asChild>
            <div className="flex justify-end w-full">
              <Button
                variant='default'
                className='bg-[#800020] text-xl font-bold w-[200px] h-[60px] -mb-12'
              >
              الميزانية والهدايا
              </Button>
            </div>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-3xl mt-5 font-bold text-right block rtl">
                {editingBudget ? 'تعديل' : 'الميزانية والهدايا'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xl font-bold text-right block rtl">السنة</label>
                <Input
                  type="number"
                  required
                  value={yearBudget.year}
                  onChange={e =>
                    setYearBudget({
                      ...yearBudget,
                      year: e.target.value
                    })
                  }
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xl font-bold text-right block rtl">المبلغ</label>
                <Input
                  type="number"
                  required
                  value={yearBudget.budget}
                  onChange={e =>
                    setYearBudget({
                      ...yearBudget,
                      budget: e.target.value
                    })
                  }
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xl font-bold text-right block rtl">الهدية</label>
                <Input
                  type="number"
                  required
                  value={yearBudget.gift}
                  onChange={e =>
                    setYearBudget({
                      ...yearBudget,
                      gift: e.target.value
                    })
                  }
                  className="text-right"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#800020] text-xl font-bold"
              >
                {editingBudget ? 'تحديث' : 'حفظ'}
              </Button>
            </form>
          </DialogContent>

          </Dialog>
          </div>
          <DataTable columns={budgetCols} data={budgetPaginatedData()} />

          <div className="flex justify-between mt-4">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center">
              <label className="mr-2">Rows per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex space-x-2">
              {Array.from({ length: budgetPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === index + 1
                      ? "bg-[#942c51] text-white"
                      : "bg-[#e1a3b1] text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='backup'>
          <div className='flex justify-start items-center my-4'>
          <Button
            variant='default'
            className='bg-[#800020] text-xl font-bold w-[200px] h-[60px] -mb-12'
            onClick={backup}
          >
          النسخ
          </Button>
          <Dialog
            open={isGiftModalOpen}
            onOpenChange={setIsGiftModalOpen}
          >
            <DialogTrigger asChild>
            <div className="flex justify-end w-full">
              <Button
                variant='default'
                className='bg-[#800020] text-xl font-bold w-[200px] h-[60px] -mb-12'
              >
              الاسترجاع
              </Button>
            </div>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-3xl mt-5 font-bold text-right block rtl">
              الاسترجاع
            </DialogTitle>
          </DialogHeader>
            <form onSubmit={handleBackupSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xl font-bold text-right block rtl">
                  ملف النسخة الاحتياطية
                </label>
                <Input
                  type="file"
                  required
                  className="text-right"
                  onChange={(e) => setBackupFile(e.target.files[0])}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#800020] text-xl font-bold"
              >
                حفظ
              </Button>
            </form>
        </DialogContent>

        </Dialog>
        </div>
      </TabsContent>
      </Tabs>
    </div>
  )
}
