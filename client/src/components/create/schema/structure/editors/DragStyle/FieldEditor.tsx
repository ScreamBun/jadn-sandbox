import React, { memo, useMemo, useRef, useState } from 'react';
import {
  Button, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import {
  FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from '../consts';
import OptionsModal from '../options/OptionsModal';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import { objectValues, zip } from '../../../../../utils';
import { useAppSelector } from '../../../../../../reducers';
import { sbToastError } from 'components/common/SBToast';
import SBCreatableSelect from 'components/common/SBCreatableSelect';
import { Option } from 'components/common/SBSelect';
import { ModalSize } from '../options/ModalSize';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core'
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import { DragItem } from './SBOutlineFields';

interface FieldEditorProps {
  id: any;
  enumerated?: boolean;
  dataIndex: number;
  value: EnumeratedFieldArray | StandardFieldArray;
  change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
  config: InfoConfig;
  editableID: boolean;
  //changeIndex: (_v: FieldArray, _i: number, _j: number) => void;

  isDraggable: boolean;
  moveCard: (originalIndex: number, newIndex: number) => void;
  dropCard: (arg: DragItem) => void;
  acceptableType: string;
}


const FieldEditor = memo(function FieldEditor(props: FieldEditorProps) {
  const { enumerated = false, value, dataIndex, change, config, acceptableType, isDraggable = true, moveCard, id, dropCard, remove, editableID } = props;
  const types = useAppSelector((state) => ({
    base: state.Util.types.base,
    schema: Object.keys(state.Util.types.schema) || {}
  }));

  const [modal, setModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;
  const valueObjInit = zip(fieldKeys, value) as FieldObject;
  const [valueObj, setValueObj] = useState(valueObjInit);
  const val = valueObj as StandardFieldObject;
  const [valType, setValType] = useState({ value: val.type, label: val.type });
  const [focus, setFocus] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: acceptableType,
      item: () => { return { id, dataIndex, value } },
      canDrag: isDraggable,
      collect: (monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
      }),
    }), [acceptableType, isDraggable]
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
    drop(item: DragItem, _monitor) {
      dropCard(item);
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
      opacity: isDragging || !isDraggable ? 0.4 : 1,
    }),
    [isDragging, isDraggable],
  )

  const handleStyle = useMemo(
    () => ({
      cursor: isDraggable ? 'move' : 'default',
    }),
    [isDragging, isDraggable],
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

  const onFocus = () => {
    setFocus(true);
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    setFocus(false);

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
    if (!modal) {
      setFocus(true);
    } else {
      setFocus(false);
    }
  }

  const makeOptions = () => {
    if (enumerated) {
      const val = valueObj as EnumeratedFieldObject;
      return (
        <div className="row m-0">
          <FormGroup className='col-md-2'>
            <Label>ID</Label>
            <Input name="FieldEditorID" type="number" placeholder="ID" className='form-control' value={valueObj.id}
              onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
          </FormGroup>
          <div className="col-md-4">
            <Label>Value</Label>
            <Input name="FieldEditorValue" type="text" placeholder="Value" className='form-control' value={val.value}
              onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
          </div>
          <FormGroup className='col-md-6'>
            <Label>Comment</Label>
            <Input
              name="FieldEditorComment"
              type="textarea"
              className='form-control'
              placeholder="Comment"
              rows={1}
              value={valueObj.comment}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          </FormGroup>
        </div>
      );
    }

    return (
      <>
        <div className="row">
          <div className="col-md-2">
            <Label className='mb-0'>ID</Label>
          </div>
          <div className="col-md-4">
            <Label className='mb-0'>Name</Label>
          </div>
          <div className="col-md-4">
            <Label className='mb-0'>Type</Label>
          </div>
        </div>
        <div className="row">
          <div className="col-md-2">
            <Input name="FieldEditorID" type="number" placeholder="ID" className='form-control' value={valueObj.id}
              onChange={onChange} onBlur={onBlur} readOnly={!editableID} onFocus={onFocus}
              title={`${editableID ? '' : 'If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.'}`} />

          </div>
          <div className="col-md-4">
            <Input name="FieldEditorName" type="text" placeholder="Name" className='form-control' maxLength={64} value={val.name}
              onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
          </div>
          <div className="col-md-4">
            <SBCreatableSelect id="Type" name="Type" value={valType} onChange={onSelectChange} data={types}
              onFocus={onFocus} onBlur={() => setFocus(false)} isGrouped />
          </div>
          <div className="col-md-2">
            <Button color="primary" className='btn-sm p-2' onClick={toggleModal}>Field Options</Button>
            <OptionsModal
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
          <FormGroup className='col-md-12'>
            <Label>Comment</Label>
            <Input
              name="FieldEditorComment"
              type="textarea"
              placeholder="Comment"
              rows={1}
              className='form-control'
              value={valueObj.comment}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          </FormGroup>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`card ${focus ? 'border-primary border-3' : 'border-secondary'} mb-2`} ref={previewRef} data-handler-id={handlerId} style={containerStyle}>
        <div className="card-body px-2 py-2">
          <div ref={dragRef} style={handleStyle}>
            <FontAwesomeIcon className='float-right pt-1 pl-2 m-1' title={'Drag and drop to reorder'} icon={faGrip}></FontAwesomeIcon>
            <a href="#" role="button" onClick={onRemoveItemClick}>
              <FontAwesomeIcon className='float-right pt-1 m-1' color='red' title={`Delete Field`} icon={faMinusCircle}></FontAwesomeIcon>
            </a>
          </div>

          {makeOptions()}
        </div>
      </div>
      <SBConfirmModal
        isOpen={isConfirmModalOpen}
        title={`Remove ${val.name}`}
        message={`Are you sure you want to remove ${val.name}?`}
        confirm_value={dataIndex}
        onResponse={removeAll}></SBConfirmModal>
    </>
  );
});

export default FieldEditor;