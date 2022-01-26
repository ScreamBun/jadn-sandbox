import React, { Component } from 'react';
import { Button, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import { ConfigOptions } from './consts';
import KeyValueEditor from './key_value';

// Interfaces
interface ConfigEditorState {
  $MaxBinary: number;
  $MaxString: number;
  $MaxElements: number;
  $FS: string;
  $Sys: string;
  $TypeName: string;
  $FieldName: string;
  $NSID: string;
}

interface ConfigEditorProps {
  name: string;
  placeholder?: string;
  description?: string;
  value: ConfigEditorState;
  change: (_v: ConfigEditorState) => void;
  remove: (_id: string) => void;
}

// Config Editor
class ConfigEditor extends Component<ConfigEditorProps, ConfigEditorState> {
  static defaultProps = {
    placeholder: 'ConfigObjectEditor'
  };

  constructor(props: ConfigEditorProps) {
    super(props);
    this.removeAll = this.removeAll.bind(this);

    const { value } = this.props;
    this.state = {
      ...value
    };
  }

  shouldComponentUpdate(nextProps: ConfigEditorProps, nextState: ConfigEditorState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;

    if (this.state !== nextState) {
      const { change } = this.props;
      change(nextState);
    }
    return propsChange || stateChange;
  }

  onChange(k: string, v: any) {
    this.setState(prevState => {
      const ps = { ...prevState };
      if (v === '') {
        delete ps[k];
      } else {
        ps[k] = v;
      }
      return ps;
    });
  }

  removeAll() {
    const { name, remove } = this.props;
    remove(name.toLowerCase());
  }

  render() {
    const { description, name } = this.props;
    const keys = Object.keys(ConfigOptions).map(k => {
      const keyProps = {
        ...ConfigOptions[k],
        placeholder: k,
        change: (v: any) => this.onChange(k, v),
        removable: false
      };
      if (k in this.state) {
        // eslint-disable-next-line react/destructuring-assignment
        keyProps.value = this.state[k];
      }
      return <KeyValueEditor key={ k } name={ k } { ...keyProps } />;
    });

    return (
      <div className="border m-1 p-1">
        <Button color="danger" size="sm" className="float-right" onClick={ this.removeAll } >
          <FontAwesomeIcon
            icon={ faMinusCircle }
          />
        </Button>
        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ name }</strong></p>
          { description ? <FormText color='muted' className='ml-3'>{ description }</FormText> : '' }
        </div>
        <div className="col-12 m-0">
          { keys }
        </div>
      </div>
    );
  }
}

export default ConfigEditor;
