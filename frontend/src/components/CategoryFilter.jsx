function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="category-filter" aria-label="카테고리 필터">
      <p>카테고리</p>
      <div>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={category === selectedCategory ? 'active' : ''}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter
