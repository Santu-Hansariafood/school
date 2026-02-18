import { useState, useEffect, useCallback, startTransition } from 'react'
import { motion } from 'framer-motion'
import { BookPlus } from 'lucide-react'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { useToast } from '@/components/common/Toast/ToastProvider'

const IssueBooks = () => {
  const apiClient = useApiClient()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const computeDefaultDueDate = () => {
    const base = new Date()
    base.setDate(base.getDate() + 10)
    return base.toISOString().split('T')[0]
  }
  const [dueDate, setDueDate] = useState(computeDefaultDueDate)
  const [issued, setIssued] = useState(false)

  const [studentsList, setStudentsList] = useState([])
  const [availableBooks, setAvailableBooks] = useState([])

  const loadStudents = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/students')
      startTransition(() => {
        setStudentsList(res.data || [])
      })
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }, [apiClient])

  const loadAvailableBooks = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/library/books?status=available')
      startTransition(() => {
        setAvailableBooks(res.data || [])
      })
    } catch (error) {
      console.error('Error loading books:', error)
    }
  }, [apiClient])

  useEffect(() => {
    loadStudents()
    loadAvailableBooks()
  }, [loadStudents, loadAvailableBooks])

  const filteredStudents = studentsList.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleIssue = async () => {
    if (selectedStudent && selectedBook && dueDate) {
      try {
        await apiClient.post('/api/library/issuances', {
          bookId: selectedBook._id,
          studentId: selectedStudent._id,
          dueDate
        })
        setIssued(true)
        showToast({ type: 'success', message: 'Book issued successfully' })
        await loadAvailableBooks()
        setTimeout(() => {
          setIssued(false)
          setSelectedStudent(null)
          setSelectedBook(null)
          setDueDate(computeDefaultDueDate())
          setSearchTerm('')
        }, 3000)
      } catch (error) {
        console.error('Error issuing book:', error)
        showToast({ type: 'error', message: 'Failed to issue book' })
      }
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Issue Books</h1>
      {issued && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg">
          Book issued successfully! Due date: {dueDate}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Student</h2>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or ID..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4" />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map(student => (
                <motion.div key={student._id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedStudent(student)} className={`p-3 border rounded-lg cursor-pointer transition ${
                  selectedStudent?._id === student._id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                }`}>
                  <p className="font-semibold text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email} - {student.class}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Books ({availableBooks.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {availableBooks.map(book => (
                <motion.div key={book._id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedBook(book)} className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedBook?._id === book._id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                }`}>
                  <p className="font-semibold text-gray-800">{book.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {book._id}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {selectedStudent && selectedBook && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Issue Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Student</p>
                  <p className="font-semibold text-gray-800">{selectedStudent.name} ({selectedStudent.email})</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Book</p>
                  <p className="font-semibold text-gray-800">{selectedBook.title}</p>
                  <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (defaults to 10 days from today)</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <button onClick={handleIssue} disabled={!dueDate} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <BookPlus className="w-5 h-5" />
                  Issue Book
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IssueBooks
