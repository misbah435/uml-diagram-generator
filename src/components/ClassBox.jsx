
import { useRef } from 'react'

function ClassBox({ classData, onMove, onSelect, isSelected }) {
  const dragRef = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  })

  const handleMouseDown = (e) => {
    e.stopPropagation()
    onSelect(classData.id)

    dragRef.current.dragging = true
    dragRef.current.offsetX = e.clientX - classData.x
    dragRef.current.offsetY = e.clientY - classData.y

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.dragging) return

      const newX = moveEvent.clientX - dragRef.current.offsetX
      const newY = moveEvent.clientY - dragRef.current.offsetY

      onMove(classData.id, newX, newY)
    }

    const handleMouseUp = () => {
      dragRef.current.dragging = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className={`class-box ${isSelected ? 'selected' : ''}`}
      style={{
        left: classData.x,
        top: classData.y,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="class-box-header">
        <span className="class-type-label">CLASS</span>
        <span>{classData.name}</span>
      </div>

      <div className="class-box-section">
        <div className="class-section-label">ATTRIBUTES</div>

        {classData.attributes.length === 0 ? (
          <div className="class-empty">No attributes</div>
        ) : (
          classData.attributes.map(attr => (
            <div key={attr.id} className="class-box-row">
              <span className="visibility-symbol">−</span>
              {attr.name}: {attr.type}
            </div>
          ))
        )}
      </div>

      <div className="class-box-section">
        <div className="class-section-label">METHODS</div>

        {classData.methods.length === 0 ? (
          <div className="class-empty">No methods</div>
        ) : (
          classData.methods.map(method => (
            <div key={method.id} className="class-box-row">
              <span className="visibility-symbol">+</span>
              {method.name}(): {method.returnType}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ClassBox
