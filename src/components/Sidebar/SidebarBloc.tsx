import { memo, useMemo, useRef } from 'react'
import { EditorComponentData, EditorComponentDefinition } from 'src/types'
import { useFieldFocused, useRemoveBloc, useSetFocusIndex } from 'src/store'
import { useToggle } from 'src/hooks/useToggle'
import { useUpdateEffect } from 'src/hooks/useUpdateEffect'
import { strToDom } from 'src/functions/dom'
import { SidebarBlocMissing } from './SidebarBlocMissing'
import { Sortable } from 'src/components/Sortable'
import Styles from './Sidebar.module.scss'
import { SidebarHeading } from './SidebarHeading'
import { prevent } from 'src/functions/functions'
import { ButtonIcon, Flex, IconDown, IconTrash } from 'src/components/ui'
import { SidebarFields } from './SidebarFields'
import { CopyAction } from './Actions/CopyAction'

type SidebarBlocProps = {
  data: EditorComponentData
  definition?: EditorComponentDefinition
  path: string
}

export const SidebarBloc = memo(function SidebarItem({
  data,
  definition,
  path,
}: SidebarBlocProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isFocused = useFieldFocused(data._id)
  const [isCollapsed, toggleCollapsed, setCollapsed] = useToggle(!isFocused)
  const removeBloc = useRemoveBloc()
  const setFocusIndex = useSetFocusIndex()
  const label =
    definition?.label && data[definition.label] ? data[definition.label] : null

  // Scroll vers l'élément lorsqu'il a le focus
  useUpdateEffect(() => {
    if (isFocused) {
      setCollapsed(false)
      window.setTimeout(
        () =>
          ref.current!.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      )
    } else {
      setCollapsed(true)
    }
  }, [isFocused])

  const labelHTMLSafe = useMemo(
    () => (label?.includes('<') ? strToDom(label).innerText : label),
    [label]
  )

  const handleRemove = () => {
    removeBloc(data)
  }

  const focusBloc = () => {
    if (isCollapsed) {
      setFocusIndex(path)
    }
    toggleCollapsed()
  }

  if (!definition) {
    return <SidebarBlocMissing data={data} />
  }

  return (
    <Sortable item={data} className={Styles.SidebarBloc}>
      <SidebarHeading
        ref={ref}
        title={definition.title}
        description={isCollapsed ? labelHTMLSafe : null}
        onClick={prevent(focusBloc)}
      >
        <SidebarHeading.Hover>
          <CopyAction data={data} size={20} />
          <ButtonIcon danger onClick={handleRemove} title="Supprimer l'élément">
            <IconTrash size={20} />
          </ButtonIcon>
        </SidebarHeading.Hover>
        <ButtonIcon
          rotate={isCollapsed ? -90 : 0}
          onClick={prevent(toggleCollapsed)}
        >
          <IconDown size={20} />
        </ButtonIcon>
      </SidebarHeading>
      {!isCollapsed && (
        <Flex column gap={1} className={Styles.SidebarBlocBody}>
          <SidebarFields fields={definition.fields} data={data} path={path} />
        </Flex>
      )}
    </Sortable>
  )
})
