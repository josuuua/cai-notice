import { useState } from 'react'
import { departments } from './constants/noticeOptions'
import HomePage from './pages/HomePage'
import NoticeListPage from './pages/NoticeListPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0])

  if (currentPage === 'noticeList') {
    return (
      <NoticeListPage
        selectedDepartment={selectedDepartment}
        onBackToHome={() => setCurrentPage('home')}
      />
    )
  }

  return (
    <HomePage
      selectedDepartment={selectedDepartment}
      onDepartmentChange={setSelectedDepartment}
      onStart={() => setCurrentPage('noticeList')}
    />
  )
}

export default App
