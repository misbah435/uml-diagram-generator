
import { useState } from 'react'

function getDefaultReturn(returnType) {
  const type = returnType.trim()

  if (type === 'void') return null
  if (type === 'boolean') return 'false'
  if (type === 'String') return '""'
  if (type === 'char') return "'\\0'"

  if (['int', 'long', 'short', 'byte', 'float', 'double'].includes(type)) {
    return '0'
  }

  return 'null'
}

function toFieldName(className) {
  return className.charAt(0).toLowerCase() + className.slice(1)
}

function generateJavaCode(cls, relationships, allClasses) {
  const inheritance = relationships.find(
    r => r.type === 'inheritance' && r.fromId === cls.id
  )

  const parentClass = inheritance
    ? allClasses.find(c => c.id === inheritance.toId)
    : null

  const outgoingRelationships = relationships.filter(
    r => r.fromId === cls.id && r.type !== 'inheritance'
  )

  const fields = []
  const dependencyComments = []
  const imports = new Set()

  outgoingRelationships.forEach(rel => {
    const targetClass = allClasses.find(c => c.id === rel.toId)

    if (!targetClass) return

    if (rel.type === 'dependency') {
      dependencyComments.push(
        `    // Dependency: uses ${targetClass.name}`
      )
      return
    }

    const fieldName = toFieldName(targetClass.name)
    const isCollection = ['*', '0..*', '1..*'].includes(
      rel.toMultiplicity
    )

    if (isCollection) {
      imports.add('import java.util.List;')
      fields.push({
        name: fieldName,
        declaration: `    private List<${targetClass.name}> ${fieldName};`,
        comment: rel.type,
      })
    } else {
      fields.push({
        name: fieldName,
        declaration: `    private ${targetClass.name} ${fieldName};`,
        comment: rel.type,
      })
    }
  })

  let code = ''

  if (imports.size > 0) {
    code += [...imports].join('\n') + '\n\n'
  }

  code += `public class ${cls.name}`

  if (parentClass) {
    code += ` extends ${parentClass.name}`
  }

  code += ' {\n\n'

  cls.attributes.forEach(attr => {
    code += `    private ${attr.type} ${attr.name};\n`
  })

  if (cls.attributes.length > 0 && fields.length > 0) {
    code += '\n'
  }

  fields.forEach(field => {
    code += `    // ${field.comment}\n`
    code += `${field.declaration}\n`
  })

  if (fields.length > 0) {
    code += '\n'
  }

  dependencyComments.forEach(comment => {
    code += `${comment}\n`
  })

  if (dependencyComments.length > 0) {
    code += '\n'
  }

  cls.methods.forEach(method => {
    code += `    public ${method.returnType} ${method.name}() {\n`
    code += '        // TODO: implement\n'

    const defaultValue = getDefaultReturn(method.returnType)

    if (defaultValue !== null) {
      code += `        return ${defaultValue};\n`
    }

    code += '    }\n\n'
  })

  code += '}'

  return code
}

function CodePanel({ classes, relationships }) {
  const [copiedId, setCopiedId] = useState(null)

  const copyCode = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Unable to copy code:', error)
      alert('Copy failed. Please select and copy the code manually.')
    }
  }

  const downloadCode = (code, className) => {
    const safeName = className.replace(/[^a-zA-Z0-9_$]/g, '_')

    const blob = new Blob([code], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${safeName}.java`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="code-panel">
      <div className="code-panel-heading">
        <div>
          <span className="code-panel-eyebrow">
            CLASSCRAFT / OUTPUT
          </span>

          <h3 className="code-panel-title">Java Code</h3>

          <p className="code-panel-description">
            Generated Java source code from your UML diagram.
          </p>
        </div>

        <span className="code-language-badge">JAVA</span>
      </div>

      {classes.length === 0 ? (
        <div className="code-empty-state">
          <span>⌘</span>
          <p>No classes available.</p>
          <small>Add a class to generate Java code.</small>
        </div>
      ) : (
        classes.map(cls => {
          const code = generateJavaCode(
            cls,
            relationships,
            classes
          )

          return (
            <div key={cls.id} className="code-block">
              <div className="code-block-heading">
                <span className="code-file-name">
                  {cls.name}.java
                </span>

                <div className="code-actions">
                  <button
                    className="code-action-btn"
                    onClick={() => copyCode(code, cls.id)}
                  >
                    {copiedId === cls.id ? '✓ Copied' : 'Copy'}
                  </button>

                  <button
                    className="code-action-btn primary"
                    onClick={() => downloadCode(code, cls.name)}
                  >
                    ↓ Download
                  </button>
                </div>
              </div>

              <pre>
                <code>{code}</code>
              </pre>
            </div>
          )
        })
      )}
    </div>
  )
}

export default CodePanel
