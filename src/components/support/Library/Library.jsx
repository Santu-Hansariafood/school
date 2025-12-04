import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, Calendar, User } from 'lucide-react'
import { libraryBooks } from '@/data/mockData'

const Library = ({ role }) => {
  const [books, setBooks] = useState(libraryBooks)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleIssue = (id) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, status: 'issued', issuedTo: role === 'student' ? 'You' : 'S001' } : book
    ))
  }

  const handleReturn = (id) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, status: 'available', issuedTo: null } : book
    ))
  }

  const myBooks = role === 'student' ? books.filter(b => b.issuedTo === 'You') : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Library Management</h1>

      {role === 'student' && myBooks.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">My Issued Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBooks.map(book => (
              <div key={book.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-800">{book.title}</h3>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">Due: {book.dueDate || 'N/A'}</span>
                  <button onClick={() => handleReturn(book.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition">
                    Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search books by title or author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Book ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Author</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                {role !== 'student' && <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{book.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{book.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${book.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {book.status}
                    </span>
                  </td>
                  {role !== 'student' && (
                    <td className="px-4 py-3 text-center">
                      {book.status === 'available' ? (
                        <button onClick={() => handleIssue(book.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                          Issue
                        </button>
                      ) : (
                        <button onClick={() => handleReturn(book.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition">
                          Return
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default Library
