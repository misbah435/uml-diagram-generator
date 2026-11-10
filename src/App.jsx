
import { useRef, useState } from 'react'
import ClassBox from './components/ClassBox'
import Inspector from './components/Inspector'
import RelationshipLines from './components/RelationshipLines'
import CodePanel from './components/CodePanel'
import './App.css'

let classCounter = 2
let relCounter = 1

function App() {
  const [classes, setClasses] = useState([
    {
      id: 'class-1',
      name: 'Student',
      x: 150,
      y: 150,
      attributes: [
        { id: 'a1', name: 'name', type: 'String' },
        { id: 'a2', name: 'age', type: 'int' },
      ],
      methods: [
        { id: 'm1', name: 'getName', returnType: 'String' },
      ],
    },
  ])

  const [relationships, setRelationships] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectFrom, setConnectFrom] = useState(null)
  const [relationshipType, setRelationshipType] = useState('association')
  const [showCode, setShowCode] = useState(false)
  const [notice, setNotice] = useState('')

  const fileInputRef = useRef(null)

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 3000)
  }

  const moveClass = (id, x, y) => {
    setClasses(prev =>
      prev.map(c => c.id === id ? { ...c, x, y } : c)
    )
  }

  const addClass = () => {
    const newClass = {
      id: `class-${classCounter++}`,
      name: `NewClass${classCounter - 1}`,
      x: 300,
      y: 200,
      attributes: [],
      methods: [],
    }

    setClasses(prev => [...prev, newClass])
    setSelectedId(newClass.id)
    setSelectedRelationshipId(null)
  }

  const deleteClass = (id) => {
    setClasses(prev => prev.filter(c => c.id !== id))
    setRelationships(prev =>
      prev.filter(r => r.fromId !== id && r.toId !== id)
    )
    setSelectedId(null)
    setSelectedRelationshipId(null)
    setConnectFrom(null)
  }

  const updateClass = (id, updates) => {
    setClasses(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    )
  }

  const updateRelationship = (id, updates) => {
    setRelationships(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    )
  }

  const deleteRelationship = (id) => {
    setRelationships(prev => prev.filter(r => r.id !== id))
    setSelectedRelationshipId(null)
  }

  const handleClassClick = (id) => {
    if (!connectMode) {
      setSelectedId(id)
      setSelectedRelationshipId(null)
      return
    }

    if (!connectFrom) {
      setConnectFrom(id)
      return
    }

    if (connectFrom === id) {
      setConnectFrom(null)
      return
    }

    const newRelationship = {
      id: `rel-${relCounter++}`,
      fromId: connectFrom,
      toId: id,
      type: relationshipType,
      fromMultiplicity: '1',
      toMultiplicity: '*',
    }

    setRelationships(prev => [...prev, newRelationship])
    setConnectFrom(null)
    setConnectMode(false)
    setSelectedId(null)
    setSelectedRelationshipId(newRelationship.id)
  }

  const saveDiagram = () => {
    const diagramData = {
      app: 'ClassCraft',
      version: 1,
      savedAt: new Date().toISOString(),
      classes,
      relationships,
    }

    const blob = new Blob(
      [JSON.stringify(diagramData, null, 2)],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'classcraft-diagram.json'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showNotice('Diagram saved successfully!')
  }

  const loadDiagram = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (
          !Array.isArray(data.classes) ||
          !Array.isArray(data.relationships)
        ) {
          throw new Error('Invalid diagram format')
        }

        const validClasses = data.classes.every(cls =>
          typeof cls.id === 'string' &&
          typeof cls.name === 'string' &&
          Number.isFinite(cls.x) &&
          Number.isFinite(cls.y) &&
          Array.isArray(cls.attributes) &&
          Array.isArray(cls.methods)
        )

        const classIds = new Set(data.classes.map(cls => cls.id))

        const validRelationships = data.relationships.every(rel =>
          typeof rel.id === 'string' &&
          classIds.has(rel.fromId) &&
          classIds.has(rel.toId) &&
          [
            'association',
            'inheritance',
            'aggregation',
            'composition',
            'dependency',
          ].includes(rel.type)
        )

        if (!validClasses || !validRelationships) {
          throw new Error('Invalid diagram data')
        }

        setClasses(data.classes)
        setRelationships(data.relationships)

        setSelectedId(null)
        setSelectedRelationshipId(null)
        setConnectMode(false)
        setConnectFrom(null)

        classCounter = data.classes.reduce((max, cls) => {
          const match = cls.id.match(/^class-(\d+)$/)
          return match ? Math.max(max, Number(match[1]) + 1) : max
        }, 1)

        relCounter = data.relationships.reduce((max, rel) => {
          const match = rel.id.match(/^rel-(\d+)$/)
          return match ? Math.max(max, Number(match[1]) + 1) : max
        }, 1)

        showNotice('Diagram loaded successfully!')
      } catch (error) {
        console.error('Unable to load diagram:', error)
        showNotice('Invalid JSON diagram file.')
      }

      event.target.value = ''
    }

    reader.onerror = () => {
      showNotice('Unable to read this file.')
      event.target.value = ''
    }

    reader.readAsText(file)
  }

  const selectedClass = classes.find(c => c.id === selectedId)

  const selectedRelationship = relationships.find(
    r => r.id === selectedRelationshipId
  )

  return (
    <div className="app">
      <div className="toolbar">
        <div className="toolbar-title">
          <h1>ClassCraft</h1>
          <span className="student-credit">
            Developed by Misbah Shaikh · PRN 12414009
          </span>
        </div>

        <div className="toolbar-actions">
          <button className="btn-add" onClick={addClass}>
            + Add Class
          </button>

          <select
            className="relationship-type-select"
            value={relationshipType}
            onChange={e => {
              setRelationshipType(e.target.value)
              setConnectFrom(null)
            }}
            aria-label="Relationship type"
          >
            <option value="association">Association</option>
            <option value="inheritance">Inheritance</option>
            <option value="aggregation">Aggregation</option>
            <option value="composition">Composition</option>
            <option value="dependency">Dependency</option>
          </select>

          <button
            className={`btn-connect ${connectMode ? 'active' : ''}`}
            onClick={() => {
              setConnectMode(prev => !prev)
              setConnectFrom(null)
              setSelectedRelationshipId(null)
            }}
          >
            {connectMode
              ? connectFrom
                ? 'Click target class...'
                : 'Click first class...'
              : '⛓ Connect Classes'}
          </button>

          <button
            className="btn-code"
            onClick={() => setShowCode(prev => !prev)}
          >
            {showCode ? 'Hide Code' : '</> View Java Code'}
          </button>

          <button className="btn-code" onClick={saveDiagram}>
            ↓ Save Diagram
          </button>

          <button
            className="btn-code"
            onClick={() => fileInputRef.current?.click()}
          >
            ↑ Load Diagram
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={loadDiagram}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {notice && (
        <div className="app-notice" role="status">
          {notice}
        </div>
      )}

      <div className="workspace">
        <div
          className="canvas"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !connectMode) {
              setSelectedId(null)
              setSelectedRelationshipId(null)
            }
          }}
        >
          <RelationshipLines
            classes={classes}
            relationships={relationships}
            onDelete={deleteRelationship}
            onSelect={id => {
              setSelectedRelationshipId(id)
              setSelectedId(null)
            }}
            selectedRelationshipId={selectedRelationshipId}
          />

          {classes.map(cls => (
            <ClassBox
              key={cls.id}
              classData={cls}
              onMove={moveClass}
              onSelect={handleClassClick}
              isSelected={
                selectedId === cls.id || connectFrom === cls.id
              }
            />
          ))}
        </div>

        {showCode ? (
          <CodePanel
            classes={classes}
            relationships={relationships}
          />
        ) : (
          <Inspector
            selectedClass={selectedClass}
            selectedRelationship={selectedRelationship}
            onUpdate={updateClass}
            onUpdateRelationship={updateRelationship}
            onDelete={deleteClass}
            onDeleteRelationship={deleteRelationship}
          />
        )}
      </div>
    </div>
  )
}

export default App
