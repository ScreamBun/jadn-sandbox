import React from 'react';
import {
  ConfigObjectEditor, KeyArrayEditor, KeyObjectEditor, KeyValueEditor
} from './editors';
import { InfoDef } from './interfaces';

interface EditorProps {
  key?: number|string; 
  name: string;
  description: string;
  placeholder?: string;
  value: any;
  change: (_a: boolean|number|string) => void;
  remove: (_id: string) => void;
}

interface ObjectEditorProps {
  key?: number|string; 
  name: string;
  description: string;
  placeholder?: string;
  value: Record<string, any>;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
}

interface ArrayEditorProps {
  key?: number|string; 
  name: string;
  description: string;
  placeholder?: string;
  value: Array<any>;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
}

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
  change: (_a: boolean|number|string) => void;
  remove: (_id: string) => void;
}

const metaDef = ({ k='key', v='' }: InfoDef) => ({ [k]: v } as Record<string, any>);

// JADN Info Structure
export default {
  package: {
    key: 'Package',
    edit: (val: string) => metaDef({ k: 'package', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor
        { ...props }
        name="Package"
        description="Unique name/version"
      />
    )
  },
  version: {
    key: 'Version',
    edit: (val: string) => metaDef({ k: 'version', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor 
        { ...props } 
        name="Version" 
        description="Version"
      />
    )     
  },
  title: {
    key: 'Title',
    edit: (val: string) => metaDef({ k: 'title', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor 
        { ...props } 
        name="Title" 
        description="Title"
      />
    )    
  },
  description: {
    key: 'Description',
    edit: (val: string) => metaDef({ k: 'description', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor 
        { ...props } 
        name="Description" 
        description="Description"
      />
    )     
  },
  comment: {
    key: 'Comment',
    edit: (val: string) => metaDef({ k: 'comment', v: val }),
    editor: (props: EditorProps) => (
      <KeyValueEditor 
        { ...props } 
        name="Comment" 
        description="Comment"
      />
    )    
  },
  copyright: {
    key: 'Copyright',
    edit: (val: string) => metaDef({ k: 'copyright', v: val }),
    editor: (props: EditorProps) => (
        <KeyValueEditor 
          { ...props } 
          name="Copyright" 
          description="Copyright"
        />
      )
  },
  license: {
    key: 'License',
    edit: (val: string) => metaDef({ k: 'license', v: val }),
    editor: (props: EditorProps) => <KeyValueEditor { ...props } name="License" />
  },
  namespaces: {
    key: 'Namespaces',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'namespaces', v: val }),
    editor: (props: ArrayEditorProps) => (
      <KeyObjectEditor
        { ...props }
        name="Namespaces"
        description="Referenced packages"
      />
    )
  },
  exports: {
    key: 'Exports',
    edit: (val: Array<string> = []) => metaDef({ k: 'exports', v: val }),
    editor: (props: ArrayEditorProps) => (
      <KeyArrayEditor
        { ...props }
        name="Exports"
        description="Type definitions exported by this module"
      />
    )
  },
  config: {
    key: 'Config',
    edit: (val: Record<string, string> = {}) => metaDef({ k: 'config', v: val }),
    editor: (props: ConfigEditorProps) => (
      <ConfigObjectEditor
        { ...props }
        name="Config"
        description="Configuration values for this module"
      />
    )
  }
};
