import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { MenuOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-components';
import './index.less';

function SortableItem(props: any) {
  const id = props['data-row-key'];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const dragStyle = {
    transition,
    '--translate-x': `${transform?.x ?? 0}px`,
    '--translate-y': `${transform?.y ?? 0}px`,
  };

  const { style, className, children, ...rest } = props;
  const cls = [className, 'dragItem', id && isDragging ? 'dragOverlay' : null]
    .filter((c) => c)
    .join(' ');

  return (
    <tr
      id={id}
      ref={setNodeRef}
      {...attributes}
      className={cls}
      style={{ ...style, ...dragStyle }}
      {...rest}
      data-cypress="draggable-item"
    >
      {React.Children.map(children, (child) => {
        if (child.key === 'sort') {
          return React.cloneElement(child, {
            additionalProps: {
              ...listeners,
              'data-cypress': 'draggable-handle',
            },
          });
        }
        return child;
      })}
    </tr>
  );
}

function DraggableEditTable({
  value,
  onChange,
  columns,
  recordCreatorProps,
  rowKey = 'key',
  ...restProps
}: any) {
  const [editableKeys, setEditableRowKeys] = useState([]);
  useEffect(() => {
    console.log(99, value);
    setEditableRowKeys(value ? value.map((item: any) => item[rowKey]) : []);
  }, [value]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log(active.id, over?.id);
    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((item: any) => item[rowKey] === active.id);
      const newIndex = value.findIndex((item: any) => item[rowKey] === over?.id);
      const next = arrayMove(value, oldIndex, newIndex);
      onChange(next);
    }
  };

  const newColumns = [
    ...columns,
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: 20,
      render: () => <MenuOutlined />,
      align: 'center',
      editable: false,
    },
  ];

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <SortableContext
        items={value ? value.map((c: any) => c[rowKey]) : [-1]}
        strategy={verticalListSortingStrategy}
      >
        <EditableProTable
          rowKey={rowKey}
          showHeader={false}
          style={{
            width: '260px',
            marginLeft: '-50px',
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            actionRender: () => {
              return [];
            },
          }}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            position: 'bottom',
            record: () => ({
              [rowKey]: Date.now().toString(),
            }),

            ...recordCreatorProps,
          }}
          value={value}
          columns={newColumns}
          pagination={false}
          components={{ body: { row: SortableItem } }}
          onValuesChange={(values) => {
            onChange(values);
          }}
          ghost
          locale={{
            emptyText: '暂无数据',
          }}
          {...restProps}
        />
      </SortableContext>
    </DndContext>
  );
}

export default DraggableEditTable;
