import React, { memo, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { XYCoord } from 'dnd-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { EnumeratedFieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import { DragItem } from './SBOutlineFields';
import SBSelect, { Option } from 'components/common/SBSelect';
import { EnumeratedFieldObject, StandardFieldObject } from '../consts';
import { ModalSize } from '../options/ModalSize';
import OptionsModal from '../options/OptionsModal';
import withFieldEditor from '../ParentEditor/withFieldEditor';

interface FieldEditorProps {
  id: any;
  enumerated?: boolean;
  parentIndex: number;
  dataIndex: number;
  value: EnumeratedFieldArray | StandardFieldArray;
  change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
  config: InfoConfig;
  editableID: boolean;
  isDragging: boolean;
  moveCard: (dragCardValue: EnumeratedFieldArray | StandardFieldArray, newIndex: number) => void;
  dropCard: (arg: DragItem) => void;
  acceptableType: string;
  valueObj: EnumeratedFieldObject | StandardFieldObject;
  valType: Option;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSelectChange: (e: Option) => void;
  modal: boolean;
  saveModal: (modalData: Array<string>) => void;
  toggleModal: () => void;
  onRemoveItemClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  types: { base: string[]; schema: string[]; };
}


const FieldEditorDnd = memo(function FieldEditorDnd(props: FieldEditorProps) {
  const { editableID, enumerated, value, parentIndex, dataIndex, acceptableType, moveCard, id, dropCard, isDragging,
    valueObj, valType, onChange, onBlur, onSelectChange,
    modal, saveModal, toggleModal, onRemoveItemClick, types } = props;

  const dragRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const originalIndex = dataIndex;

  const [{ handlerId }, drag, preview] = useDrag(
    () => ({
      type: acceptableType,
      item: () => { return { id, originalIndex, dataIndex, value } },
      collect: (monitor) => ({
        item: monitor.getItem(),
        handlerId: monitor.getHandlerId(),
      }),
      end: (item, monitor) => {
        const didDrop = monitor.didDrop()
        if (!didDrop) {
          moveCard(item.value, item.originalIndex)
        } else {
          dropCard(item);
        }
      },
    }), [acceptableType, id, originalIndex, dataIndex, value]
  )

  const [, drop] = useDrop<
    DragItem,
    void>({
      accept: acceptableType,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        }
      },
      hover(draggedItem: DragItem, monitor) {
        if (!previewRef.current) {
          return
        }
        const dragIndex = draggedItem.dataIndex
        const hoverIndex = dataIndex

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return
        }

        // Determine rectangle on screen
        const hoverBoundingRect = previewRef.current?.getBoundingClientRect()

        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

        // Determine mouse position
        const clientOffset = monitor.getClientOffset()

        // Get pixels to the top
        const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return
        }

        // Time to actually perform the action
        moveCard(draggedItem.value, hoverIndex)

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        draggedItem.dataIndex = hoverIndex
      },
    })

  drag(dragRef)
  drop(preview(previewRef))

  const containerStyle = useMemo(
    () => ({
      opacity: isDragging ? 0.4 : 1,
    }),
    [isDragging],
  )

  const makeOptions = () => {
    if (enumerated) {
      return (
        <div className="row m-0">
          <div className='col-md-2'>
            <label htmlFor={`id-${parentIndex}-${dataIndex}`}>ID</label>
            <input id={`id-${parentIndex}-${dataIndex}`} name="id" type="number" placeholder="ID" className='form-control' value={valueObj.id}
              onChange={onChange} onBlur={onBlur} />
          </div>
          <div className="col-md-4">
            <label htmlFor={`value-${parentIndex}-${dataIndex}`} >Value</label>
            <input id={`value-${parentIndex}-${dataIndex}`} name="value" type="text" placeholder="Value" className='form-control' value={valueObj.value}
              onChange={onChange} onBlur={onBlur} />
          </div>
          <div className='col-md-6'>
            <label htmlFor={`comment-${parentIndex}-${dataIndex}`}>Comment</label>
            <input
              id={`comment-${parentIndex}-${dataIndex}`}
              name="comment"
              type="textarea"
              className='form-control'
              placeholder="Comment"
              value={valueObj.comment}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="row">
          <div className="col-md-2">
            <label htmlFor={`id-${parentIndex}-${dataIndex}`} className='mb-0'>ID</label>
            <input id={`id-${parentIndex}-${dataIndex}`}
              name="id"
              type="number"
              placeholder="ID"
              className={editableID ? 'form-control' : 'form-control-plaintext'}
              value={valueObj.id}
              onChange={onChange}
              onBlur={onBlur}
              readOnly={!editableID}
              title={`${editableID ? '' : 'If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.'}`} />
          </div>
          <div className="col-md-4">
            <label htmlFor={`name-${parentIndex}-${dataIndex}`} className='mb-0'>Name</label>
            <input id={`name-${parentIndex}-${dataIndex}`}
              name="name"
              type="text"
              placeholder="Name"
              className='form-control'
              maxLength={64}
              value={valueObj.name}
              onChange={onChange}
              onBlur={onBlur} />
          </div>
          <div className="col-md-4">
            <label htmlFor={`type-${parentIndex}-${dataIndex}`} className='mb-0'>Type</label>
            <SBSelect id={`type-${parentIndex}-${dataIndex}`}
              name="type"
              value={valType}
              onChange={onSelectChange}
              data={types}
              isGrouped
              isCreatable
              isClearable />
          </div>
          <div className="col-md-2 d-flex">
            <button type='button' className='btn btn-primary btn-sm p-2 mt-auto' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal}>Field Options</button>
            <OptionsModal
              id={`${parentIndex}-${dataIndex}`}
              optionValues={valueObj.options || []}
              isOpen={modal}
              saveModal={saveModal}
              toggleModal={toggleModal}
              optionType={valueObj.type}
              modalSize={ModalSize.lg}
              fieldOptions={true}
            />
          </div>
        </div>

        <div className="row">
          <div className='col-md-12'>
            <label htmlFor={`comment-${parentIndex}-${dataIndex}`} className='mb-0'>Comment</label>
            <input
              id={`comment-${parentIndex}-${dataIndex}`}
              name="comment"
              type="textarea"
              placeholder="Comment"
              className='form-control'
              value={valueObj.comment}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`card mb-2`} ref={previewRef} data-handler-id={handlerId} style={containerStyle}>
        <div className="card-body px-2 py-2">
          <div ref={dragRef} style={{ cursor: 'move' }}>
            <FontAwesomeIcon className='float-end pt-1 pl-2 m-1' title={'Drag and drop to reorder'} icon={faGrip}></FontAwesomeIcon>
            <a href="#" role="button" onClick={onRemoveItemClick}>
              <FontAwesomeIcon className='float-end pt-1 m-1' color='red' title={`Delete Field`} icon={faMinusCircle}></FontAwesomeIcon>
            </a>
          </div>
          {makeOptions()}
        </div>
      </div>
    </>
  );
});

export const FieldEditorDndStyle = withFieldEditor(FieldEditorDnd);