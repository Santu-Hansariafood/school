export const users = [
  { id: 'A001', username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin', email: 'admin@school.com' },
  { id: 'T001', username: 'teacher', password: 'teacher123', name: 'John Smith', role: 'teacher', email: 'john@school.com' },
  { id: 'S001', username: 'student', password: 'student123', name: 'Emma Johnson', role: 'student', email: 'emma@school.com' }
]

export const students = [
  { id: 'S001', name: 'Emma Johnson', class: '10-A', email: 'emma@school.com', phone: '+1-555-0101', address: '123 Oak Street, Springfield', dateOfBirth: '2008-05-15', gender: 'Female', parentName: 'Robert Johnson', parentPhone: '+1-555-0102' },
  { id: 'S002', name: 'Michael Brown', class: '10-A', email: 'michael@school.com', phone: '+1-555-0103', address: '456 Elm Avenue, Springfield', dateOfBirth: '2008-08-22', gender: 'Male', parentName: 'Linda Brown', parentPhone: '+1-555-0104' },
  { id: 'S003', name: 'Sophia Davis', class: '10-B', email: 'sophia@school.com', phone: '+1-555-0105', address: '789 Pine Road, Springfield', dateOfBirth: '2008-03-10', gender: 'Female', parentName: 'James Davis', parentPhone: '+1-555-0106' },
  { id: 'S004', name: 'James Wilson', class: '10-B', email: 'james@school.com', phone: '+1-555-0107', address: '321 Maple Drive, Springfield', dateOfBirth: '2008-11-30', gender: 'Male', parentName: 'Patricia Wilson', parentPhone: '+1-555-0108' },
  { id: 'S005', name: 'Olivia Martinez', class: '9-A', email: 'olivia@school.com', phone: '+1-555-0109', address: '654 Cedar Lane, Springfield', dateOfBirth: '2009-01-18', gender: 'Female', parentName: 'Carlos Martinez', parentPhone: '+1-555-0110' },
  { id: 'S006', name: 'William Garcia', class: '9-A', email: 'william@school.com', phone: '+1-555-0111', address: '987 Birch Court, Springfield', dateOfBirth: '2009-07-25', gender: 'Male', parentName: 'Maria Garcia', parentPhone: '+1-555-0112' }
]

export const teachers = [
  { id: 'T001', name: 'John Smith', subject: 'Mathematics', email: 'john@school.com', phone: '+1-555-0201', address: '111 University Ave, Springfield', dateOfBirth: '1985-04-12', gender: 'Male', experience: '10 Years', assignedClasses: ['10-A', '10-B'], qualifications: [{ degree: 'M.Sc. Mathematics', institution: 'State University', year: '2010' }] },
  { id: 'T002', name: 'Sarah Anderson', subject: 'Physics', email: 'sarah@school.com', phone: '+1-555-0202', address: '222 College Street, Springfield', dateOfBirth: '1988-09-20', gender: 'Female', experience: '8 Years', assignedClasses: ['10-A', '9-A'], qualifications: [{ degree: 'M.Sc. Physics', institution: 'National University', year: '2012' }] },
  { id: 'T003', name: 'Robert Taylor', subject: 'Chemistry', email: 'robert@school.com', phone: '+1-555-0203', address: '333 Academy Road, Springfield', dateOfBirth: '1982-12-05', gender: 'Male', experience: '12 Years', assignedClasses: ['10-B'], qualifications: [{ degree: 'M.Sc. Chemistry', institution: 'Tech University', year: '2008' }] },
  { id: 'T004', name: 'Emily White', subject: 'English', email: 'emily@school.com', phone: '+1-555-0204', address: '444 Education Lane, Springfield', dateOfBirth: '1990-06-15', gender: 'Female', experience: '6 Years', assignedClasses: ['9-A'], qualifications: [{ degree: 'M.A. English Literature', institution: 'Arts College', year: '2014' }] }
]

export const assignments = [
  { id: 1, title: 'Algebra Problems', subject: 'Mathematics', dueDate: '2024-01-25', status: 'pending', description: 'Solve problems 1-20 from chapter 5', assignedTo: ['S001', 'S002'], createdBy: 'T001', createdAt: '2024-01-15T10:00:00Z' },
  { id: 2, title: 'Newton Laws Essay', subject: 'Physics', dueDate: '2024-01-28', status: 'pending', description: 'Write an essay on Newton three laws of motion', assignedTo: ['S001', 'S002', 'S005', 'S006'], createdBy: 'T002', createdAt: '2024-01-16T09:30:00Z' },
  { id: 3, title: 'Chemical Reactions Lab', subject: 'Chemistry', dueDate: '2024-01-30', status: 'submitted', description: 'Complete lab report on chemical reactions', assignedTo: ['S003', 'S004'], createdBy: 'T003', createdAt: '2024-01-17T11:00:00Z' },
  { id: 4, title: 'Shakespeare Analysis', subject: 'English', dueDate: '2024-02-02', status: 'pending', description: 'Analyze themes in Romeo and Juliet', assignedTo: ['S005', 'S006'], createdBy: 'T004', createdAt: '2024-01-18T14:00:00Z' }
]

export const attendanceRecords = [
  { studentId: 'S001', date: '2024-01-15', status: 'present' },
  { studentId: 'S001', date: '2024-01-16', status: 'present' },
  { studentId: 'S001', date: '2024-01-17', status: 'absent' },
  { studentId: 'S001', date: '2024-01-18', status: 'present' },
  { studentId: 'S001', date: '2024-01-19', status: 'present' },
  { studentId: 'S002', date: '2024-01-15', status: 'present' },
  { studentId: 'S002', date: '2024-01-16', status: 'present' },
  { studentId: 'S003', date: '2024-01-15', status: 'absent' }
]

export const results = [
  { studentId: 'S001', subject: 'Mathematics', marks: 95, grade: 'A+' },
  { studentId: 'S001', subject: 'Physics', marks: 88, grade: 'A' },
  { studentId: 'S001', subject: 'Chemistry', marks: 82, grade: 'A' },
  { studentId: 'S001', subject: 'English', marks: 92, grade: 'A+' },
  { studentId: 'S002', subject: 'Mathematics', marks: 78, grade: 'B+' },
  { studentId: 'S002', subject: 'Physics', marks: 85, grade: 'A' }
]

export const libraryBooks = [
  { id: 'B001', title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'available', issuedTo: null },
  { id: 'B002', title: '1984', author: 'George Orwell', status: 'issued', issuedTo: 'S001', dueDate: '2024-02-10' },
  { id: 'B003', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'available', issuedTo: null },
  { id: 'B004', title: 'Pride and Prejudice', author: 'Jane Austen', status: 'issued', issuedTo: 'S002', dueDate: '2024-02-12' },
  { id: 'B005', title: 'The Catcher in the Rye', author: 'J.D. Salinger', status: 'available', issuedTo: null },
  { id: 'B006', title: 'Lord of the Flies', author: 'William Golding', status: 'available', issuedTo: null }
]

export const feeRecords = [
  { studentId: 'S001', type: 'Tuition Fee', amount: 5000, dueDate: '2024-01-31', status: 'paid', paidDate: '2024-01-20', transactionId: 'TXN1234567890ABCD' },
  { studentId: 'S001', type: 'Library Fee', amount: 200, dueDate: '2024-01-31', status: 'paid', paidDate: '2024-01-22', transactionId: 'TXN0987654321EFGH' },
  { studentId: 'S001', type: 'Lab Fee', amount: 800, dueDate: '2024-02-28', status: 'pending' },
  { studentId: 'S002', type: 'Tuition Fee', amount: 5000, dueDate: '2024-01-31', status: 'pending' },
  { studentId: 'S002', type: 'Sports Fee', amount: 500, dueDate: '2024-01-31', status: 'paid', paidDate: '2024-01-18', transactionId: 'TXN1122334455IJKL' }
]

export const registeredStudents = []

export const registeredTeachers = []

export const bookIssuanceRecords = []