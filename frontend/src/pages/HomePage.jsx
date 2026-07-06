import DepartmentSelect from '../components/DepartmentSelect'

function HomePage({ selectedDepartment, onDepartmentChange, onStart }) {
  function handleSubmit(event) {
    event.preventDefault()
    onStart()
  }

  return (
    <main className="app home-page">
      <section className="home-content" aria-labelledby="home-title">
        <p className="eyebrow">Dongguk Notice Board</p>
        <h1 id="home-title">CAI Notice</h1>
        <p className="home-copy">동국대학교 공지를 더 쉽게 확인하세요.</p>

        <form className="home-form" onSubmit={handleSubmit}>
          <DepartmentSelect
            value={selectedDepartment}
            onChange={onDepartmentChange}
          />
          <button type="submit" className="primary-action">
            시작하기
          </button>
        </form>
      </section>
    </main>
  )
}

export default HomePage
