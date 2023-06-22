import React from 'react';
import {
  ConfigObjectEditor, KeyArrayEditor, KeyObjectEditor, KeyValueEditor
} from './editors/editors';
import { InfoDef } from './interfaces';
import { InfoConfig } from '../interface';

interface EditorProps {
  key?: number | string | undefined;  // eslint-disable-line react/require-default-props
  name: string;
  description?: string;  // eslint-disable-line react/require-default-props
  placeholder: string;
  value: any;
  change?: (val: string | Record<string, any>, idx: number) => void;  // eslint-disable-line react/require-default-props
  remove?: (idx: number) => void;  // eslint-disable-line react/require-default-props
  config: InfoConfig; //defaults for Config Object Editor
}

const metaDef = ({ k = 'key', v = '' }: InfoDef) => ({ [k]: v } as Record<string, any>);

// JADN Info Structure
export default {
  package: {
    key: 'Package',
    edit: (val: string) => metaDef({ k: 'package', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor
        {...props}
        id="Package"
        name="Package"
        description="Unique name/version"
      />
    )
  },
  version: {
    key: 'Version',
    edit: (val: string) => metaDef({ k: 'version', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor {...props} id="Version" name="Version" />
  },  
  title: {
    key: 'Title',
    edit: (val: string) => metaDef({ k: 'title', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor {...props} id="Title" name="Title" />
  },  
  description: {
    key: 'Description',
    edit: (val: string) => metaDef({ k: 'description', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor {...props} id="Description" name="Description" />
  },
  comment: {
    key: 'Comment',
    edit: (val: string) => metaDef({ k: 'comment', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor {...props} id="Comment" name="Comment" />
  },
  copyright: {
    key: 'Copyright',
    edit: (val: string) => metaDef({ k: 'copyright', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor {...props} id="Copyright" name="Copyright" />
  },
  license: {
    key: 'License',
    edit: (val: string) => metaDef({ k: 'license', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor {...props} id="License" name="License" />
  },
  namespaces: {
    key: 'Namespaces',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'namespaces', v: val }),
    editor: (props: EditorProps) => (
      <KeyObjectEditor
        {...props}
        id="Namespaces"
        name="Namespaces"
        description="Referenced packages"
      />
    )
  },
  exports: {
    key: 'Exports',
    edit: (val: Array<string> = []) => metaDef({ k: 'exports', v: val }),
    editor: (props: EditorProps) => (
      <KeyArrayEditor
        {...props}
        id="Exports"
        name="Exports"
        description="Type definitions exported by this module"
      />
    )
  },
  config: {
    key: 'Config',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'config', v: val }),
    editor: (props: EditorProps) => (
      <ConfigObjectEditor
        {...props}
        id="Config"
        name="Config"
        description="Configuration values for this module"
      />
    )
  }
};
