
import { useState } from 'react'

let attrCounter = 100
let methodCounter = 100

function Inspector({
  selectedClass,
  selectedRelationship,
  onUpdate,
  onUpdateRelationship,
  onDelete,
  onDeleteRelationship,
}) {
  if (selectedRelationship) {
    return (
      <div className="inspector">
        <div className="inspector-heading">
          <span className="inspector-eyebrow">DESIGN PANEL</span>
          <h2>Relationship Properties</h2>
          <p>Configure the selected UML relationship.</p>
        </div>

        <div className="inspector-section">
          <label className="relationship-editor-label">
            RELATIONSHIP TYPE
          </label>

          <select
            className="inspector-input"
            value={selectedRelationship.type}
            onChange={e =>
              onUpdateRelationship(selectedRelationship.id, {
                type: e.target.value,
              })
            }
          >
            <option value="association">Association</option>
            <option value="inheritance">Inheritance</option>
            <option value="aggregation">Aggregation</option>
            <option value="composition">Composition</option>
            <option value="dependency">Dependency</option>
          </select>
        </div>

        <div className="inspector-section">
          <div className="inspector-section-header">
            <span>MULTIPLICITY</span>
          </div>

          <label className="relationship-editor-label">
            SOURCE MULTIPLICITY
          </label>

          <select
            className="inspector-input"
            value={selectedRelationship.fromMultiplicity || '1'}
            onChange={e =>
              onUpdateRelationship(selectedRelationship.id, {
                fromMultiplicity: e.target.value,
              })
            }
          >
            <option value="1">1</option>
            <option value="0..1">0..1</option>
            <option value="*">*</option>
            <option value="0..*">0..*</option>
            <option value="1..*">1..*</option>
          </select>

          <label className="relationship-editor-label">
            TARGET MULTIPLICITY
          </label>

          <select
            className="inspector-input"
            value={selectedRelationship.toMultiplicity || '*'}
            onChange={e =>
              onUpdateRelationship(selectedRelationship.id, {
                toMultiplicity: e.target.value,
              })
            }
          >
            <option value="1">1</option>
            <option value="0..1">0..1</option>
            <option value="*">*</option>
            <option value="0..*">0..*</option>
            <option value="1..*">1..*</option>
          </select>
        </div>

        <div className="inspector-footer">
          <button
            onClick={() =>
              onDeleteRelationship(selectedRelationship.id)
            }
            className="btn-delete-class"
          >
            Delete Relationship
          </button>

          <p>Changes are reflected on your diagram.</p>
        </div>
      </div>
    )
  }

  if (!selectedClass) {
    return (
      <div className="inspector">
        <div className="inspector-empty-state">
          <div className="inspector-empty-icon">✦</div>
          <h3>No selection</h3>
          <p>Select a class or relationship on the canvas to edit its properties.</p>
        </div>
      </div>
    )
  }

  const updateName = (name) => {
    onUpdate(selectedClass.id, { name })
  }

  const addAttribute = () => {
    const newAttr = {
      id: `a${attrCounter++}`,
      name: 'newField',
      type: 'String',
    }

    onUpdate(selectedClass.id, {
      attributes: [...selectedClass.attributes, newAttr],
    })
  }

  const updateAttribute = (attrId, field, value) => {
    const updated = selectedClass.attributes.map(a =>
      a.id === attrId ? { ...a, [field]: value } : a
    )

    onUpdate(selectedClass.id, { attributes: updated })
  }

  const deleteAttribute = (attrId) => {
    onUpdate(selectedClass.id, {
      attributes: selectedClass.attributes.filter(a => a.id !== attrId),
    })
  }

  const addMethod = () => {
    const newMethod = {
      id: `m${methodCounter++}`,
      name: 'newMethod',
      returnType: 'void',
    }

    onUpdate(selectedClass.id, {
      methods: [...selectedClass.methods, newMethod],
    })
  }

  const updateMethod = (methodId, field, value) => {
    const updated = selectedClass.methods.map(m =>
      m.id === methodId ? { ...m, [field]: value } : m
    )

    onUpdate(selectedClass.id, { methods: updated })
  }

  const deleteMethod = (methodId) => {
    onUpdate(selectedClass.id, {
      methods: selectedClass.methods.filter(m => m.id !== methodId),
    })
  }

  return (
    <div className="inspector">
      <div className="inspector-heading">
        <span className="inspector-eyebrow">DESIGN PANEL</span>
        <h2>Class Properties</h2>
        <p>Configure your UML class structure.</p>
      </div>

      <div className="inspector-header">
        <label htmlFor="class-name">CLASS NAME</label>
        <input
          id="class-name"
          type="text"
          value={selectedClass.name}
          onChange={e => updateName(e.target.value)}
          className="inspector-input"
          placeholder="Enter class name"
        />
      </div>

      <div className="inspector-section">
        <div className="inspector-section-header">
          <span>ATTRIBUTES</span>
          <span className="section-count">
            {selectedClass.attributes.length}
          </span>
          <button onClick={addAttribute} className="btn-mini">
            + Add
          </button>
        </div>

        {selectedClass.attributes.length === 0 && (
          <p className="inspector-section-empty">No attributes added yet.</p>
        )}

        {selectedClass.attributes.map(attr => (
          <div key={attr.id} className="inspector-row">
            <input
              value={attr.name}
              onChange={e =>
                updateAttribute(attr.id, 'name', e.target.value)
              }
              placeholder="Field name"
              aria-label="Attribute name"
            />

            <input
              value={attr.type}
              onChange={e =>
                updateAttribute(attr.id, 'type', e.target.value)
              }
              placeholder="Type"
              className="type-input"
              aria-label="Attribute type"
            />

            <button
              onClick={() => deleteAttribute(attr.id)}
              className="btn-remove"
              title="Remove attribute"
              aria-label="Remove attribute"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="inspector-section">
        <div className="inspector-section-header">
          <span>METHODS</span>
          <span className="section-count">
            {selectedClass.methods.length}
          </span>
          <button onClick={addMethod} className="btn-mini">
            + Add
          </button>
        </div>

        {selectedClass.methods.length === 0 && (
          <p className="inspector-section-empty">No methods added yet.</p>
        )}

        {selectedClass.methods.map(method => (
          <div key={method.id} className="inspector-row">
            <input
              value={method.name}
              onChange={e =>
                updateMethod(method.id, 'name', e.target.value)
              }
              placeholder="Method name"
              aria-label="Method name"
            />

            <input
              value={method.returnType}
              onChange={e =>
                updateMethod(method.id, 'returnType', e.target.value)
              }
              placeholder="Return type"
              className="type-input"
              aria-label="Method return type"
            />

            <button
              onClick={() => deleteMethod(method.id)}
              className="btn-remove"
              title="Remove method"
              aria-label="Remove method"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="inspector-footer">
        <button
          onClick={() => onDelete(selectedClass.id)}
          className="btn-delete-class"
        >
          Delete this class
        </button>

        <p>Changes are reflected on your diagram.</p>
      </div>
    </div>
  )
}

export default Inspector
