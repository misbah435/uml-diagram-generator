
function RelationshipLines({
  classes,
  relationships,
  onDelete,
  onSelect,
  selectedRelationshipId,
}) {
  const getClassCenter = (id) => {
    const cls = classes.find(c => c.id === id)

    if (!cls) return { x: 0, y: 0 }

    return {
      x: cls.x + 100,
      y: cls.y + 40,
    }
  }

  const getRelationshipStyle = (type) => {
    switch (type) {
      case 'inheritance':
        return {
          stroke: '#C084FC',
          marker: 'inheritanceArrow',
          dash: '',
        }
      case 'aggregation':
        return {
          stroke: '#A855F7',
          marker: 'aggregationDiamond',
          dash: '',
        }
      case 'composition':
        return {
          stroke: '#A855F7',
          marker: 'compositionDiamond',
          dash: '',
        }
      case 'dependency':
        return {
          stroke: '#C084FC',
          marker: 'dependencyArrow',
          dash: '7 5',
        }
      default:
        return {
          stroke: '#A855F7',
          marker: '',
          dash: '',
        }
    }
  }

  return (
    <svg className="relationship-svg">
      <defs>
        <marker id="inheritanceArrow" markerWidth="14" markerHeight="14"
          refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="1 1, 13 7, 1 13"
            fill="#09070F" stroke="#C084FC" strokeWidth="1.5" />
        </marker>

        <marker id="aggregationDiamond" markerWidth="16" markerHeight="14"
          refX="2" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="1 7, 7 1, 13 7, 7 13"
            fill="#09070F" stroke="#A855F7" strokeWidth="1.5" />
        </marker>

        <marker id="compositionDiamond" markerWidth="16" markerHeight="14"
          refX="2" refY="7" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="1 7, 7 1, 13 7, 7 13"
            fill="#A855F7" stroke="#A855F7" strokeWidth="1.5" />
        </marker>

        <marker id="dependencyArrow" markerWidth="12" markerHeight="12"
          refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 1 1 L 10 6 L 1 11"
            fill="none" stroke="#C084FC" strokeWidth="1.5" />
        </marker>
      </defs>

      {relationships.map(rel => {
        const from = getClassCenter(rel.fromId)
        const to = getClassCenter(rel.toId)
        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2
        const style = getRelationshipStyle(rel.type)
        const isSelected = selectedRelationshipId === rel.id

        return (
          <g key={rel.id}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isSelected ? '#F0ABFC' : style.stroke}
              strokeWidth={isSelected ? 3.5 : 2}
              strokeDasharray={style.dash}
              markerStart={
                ['aggregation', 'composition'].includes(rel.type)
                  ? `url(#${style.marker})`
                  : undefined
              }
              markerEnd={
                ['inheritance', 'dependency'].includes(rel.type)
                  ? `url(#${style.marker})`
                  : undefined
              }
              className="relationship-line"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(rel.id)
              }}
            />

            <text
              x={midX}
              y={midY - 14}
              textAnchor="middle"
              className="relationship-label"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(rel.id)
              }}
            >
              {rel.type || 'association'}
            </text>

            {rel.fromMultiplicity && (
              <text
                x={from.x + (to.x - from.x) * 0.12}
                y={from.y + (to.y - from.y) * 0.12 - 8}
                className="relationship-multiplicity"
              >
                {rel.fromMultiplicity}
              </text>
            )}

            {rel.toMultiplicity && (
              <text
                x={to.x + (from.x - to.x) * 0.12}
                y={to.y + (from.y - to.y) * 0.12 - 8}
                className="relationship-multiplicity"
              >
                {rel.toMultiplicity}
              </text>
            )}

            <circle
              cx={midX}
              cy={midY}
              r="9"
              fill="#21182E"
              stroke="#FB7185"
              strokeWidth="1.5"
              className="rel-delete-dot"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(rel.id)
              }}
            />

            <text
              x={midX}
              y={midY + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#FB7185"
              className="rel-delete-x"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(rel.id)
              }}
            >
              ×
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default RelationshipLines
