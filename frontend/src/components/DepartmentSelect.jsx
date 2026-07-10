import { departments } from '../constants/noticeOptions'

function DepartmentSelect({
  id = 'department',
  label = '학과 선택',
  value,
  onChange,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DepartmentSelect
