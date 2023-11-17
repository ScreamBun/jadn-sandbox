import React, { memo, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import {
  FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from '../consts';
import { useAppSelector } from '../../../../../../reducers';
import { objectValues, zip } from '../../../../../utils';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import { ModalSize } from '../options/ModalSize';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';
import SBCreatableSelect from 'components/common/SBCreatableSelect';
import { Option } from 'components/common/SBSelect';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import { DragItem } from './SBOutlineFields';
import { shallowEqual } from 'react-redux';

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

  moveCard: (originalIndex: number, newIndex: number) => void;
  dropCard: (arg: DragItem) => void;
  acceptableType: string;
}


const FieldEditor = memo(function FieldEditor(props: FieldEditorProps) {
  const { enumerated = false, value, dataIndex, parentIndex, change, config, acceptableType, moveCard, id, dropCard, remove, editableID } = props;
  const schemaTypes = useAppSelector((state) => (Object.keys(state.Util.types.schema)), shallowEqual);
  const types = useAppSelector((state) => ({
    base: (state.Util.types.base),
    schema: schemaTypes
  }), shallowEqual);
  const [modal, setModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;
  const valueObjInit = zip(fieldKeys, value) as FieldObject;
  const [valueObj, setValueObj] = useState(valueObjInit);
  const val = valueObj as StandardFieldObject;
  const [valType, setValType] = useState({ value: val.type, label: val.type });
  let SBConfirmModalValName = val.name;

  const dragRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const originalIndex = dataIndex;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: acceptableType,
      item: () => { return { id, originalIndex, dataIndex, value } },
      collect: (monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const didDrop = monitor.didDrop()

        console.log(didDrop, item)
        if (!didDrop) {
          moveCard(item.dataIndex, item.originalIndex)
        } else {
          dropCard(item);
        }
      },
    }), [acceptableType]
  )

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
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
      moveCard(dragIndex, hoverIndex)

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    if (enumerated) {
      if (!value) {
        sbToastError('Value required for Enum');
      }
    }
    const key = placeholder.toLowerCase();
    setValueObj({ ...valueObj, [key]: value });
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;

    if (placeholder == "Name") {
      if (value.includes('/')) {
        sbToastError('Error: FieldNames MUST NOT contain the JSON Pointer field separator "/", which is reserved for use in the Pointers extension.');
        return;
      }
      if (value.length >= 64) {
        sbToastError('Error: Max length reached');
        return;
      }
      const regex = new RegExp(config.$FieldName, "g");
      if (!regex.test(value)) {
        sbToastError('Error: FieldName format is not permitted');
      }
    }

    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value }
    if (JSON.stringify(valueObjInit) == JSON.stringify(updatevalue)) {
      return;
    }
    setValueObj(updatevalue);
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const onSelectChange = (e: Option) => {
    var updatevalue
    //clear type options 
    if (e == null) {
      //default field type is String
      setValType({ value: 'String', label: 'String' });
      updatevalue = { ...valueObj, options: [], ['type']: 'String' };

    } else {
      setValType(e);
      updatevalue = { ...valueObj, options: [], ['type']: e.value };
    }

    setValueObj(updatevalue);
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const onRemoveItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const removeAll = (response: boolean, confirm_value: number) => {
    setIsConfirmModalOpen(false);
    if (response == true) {
      remove(confirm_value);
    }
  }

  const saveModal = (modalData: Array<string>) => {
    toggleModal();
    const prevState = [...valueObj.options];
    if (JSON.stringify(prevState) === JSON.stringify(modalData)) {
      return;
    }
    const updatevalue = { ...valueObj, options: modalData }
    setValueObj(updatevalue);
    // change(updatevalue, dataIndex);
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const toggleModal = () => {
    setModal(!modal);
  }

  const makeOptions = () => {
    if (enumerated) {
      const val = valueObj as EnumeratedFieldObject;
      SBConfirmModalValName = `${val.value}`;
      return (
        <div className="row m-0">
          <div className='col-md-2'>
            <label htmlFor={`id-${parentIndex}-${dataIndex}`}>ID</label>
            <input id={`id-${parentIndex}-${dataIndex}`} name="id" type="number" placeholder="ID" className='form-control' value={valueObj.id}
              onChange={onChange} onBlur={onBlur} />
          </div>
          <div className="col-md-4">
            <label htmlFor={`value-${parentIndex}-${dataIndex}`} >Value</label>
            <input id={`value-${parentIndex}-${dataIndex}`} name="value" type="text" placeholder="Value" className='form-control' value={val.value}
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
              value={val.name}
              onChange={onChange}
              onBlur={onBlur} />
          </div>
          <div className="col-md-4">
            <label htmlFor={`type-${parentIndex}-${dataIndex}`} className='mb-0'>Type</label>
            <SBCreatableSelect id={`type-${parentIndex}-${dataIndex}`}
              name="type"
              value={valType}
              onChange={onSelectChange}
              data={types}
              isGrouped />
          </div>
          <div className="col-md-2 d-flex">
            <button type='button' className='btn btn-primary btn-sm p-2 mt-auto' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal}>Field Options</button>
            <OptionsModal
              id={`${parentIndex}-${dataIndex}`}
              optionValues={val.options || []}
              isOpen={modal}
              saveModal={saveModal}
              toggleModal={toggleModal}
              optionType={val.type}
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
      <SBConfirmModal
        isOpen={isConfirmModalOpen}
        title={`Remove ${SBConfirmModalValName}`}
        message={`Are you sure you want to remove ${SBConfirmModalValName}?`}
        confirm_value={dataIndex}
        onResponse={removeAll}></SBConfirmModal>
    </>
  );
});

export default FieldEditor;