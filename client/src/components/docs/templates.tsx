/* eslint @typescript-eslint/naming-convention: 0, react/no-array-index-key: 0, react/jsx-pascal-case: 0 */
import React, { FunctionComponent } from 'react';
import {
  Button, Card, CardBody, CardHeader, CardText, CardTitle, Table, UncontrolledCollapse
} from 'reactstrap';
import {
  ClassDefinition, Constructor, Enum, FunctionAPI
} from './jadn_api';

export const underEscape = (val: string) => val ? val.replace(/[.,\s]/g, '_').replace(/[()]/g, '') : '';


interface CardTemplateProps {
  header: string;
  title: string;
  id?: string;
  text?: Array<string>;
  body?: JSX.Element;
}

export const CardTemplate: FunctionComponent<CardTemplateProps> = ({
  id, header, title, text, body
}) => {
  const cardArgs = {
    id: '',
    className: 'mb-3 w-100'
  };
  if (id !== undefined) {
    cardArgs.id = underEscape(id);
  }

  return (
    <Card { ...cardArgs } >
      <CardHeader>
        <Button
          id={ `${underEscape(header)}-toggle` }
          className="float-right"
          color="info"
          type="button"
        >
          API
        </Button>
        <h3>{ header }</h3>
      </CardHeader>
      <CardBody>
        { title && <CardTitle>{ title }</CardTitle> }
        { text && text.map((t, i) => <CardText key={ i }>{ t }</CardText>) }
        { body && <UncontrolledCollapse toggler={ `#${underEscape(header)}-toggle` }>{ body }</UncontrolledCollapse> }
      </CardBody>
    </Card>
  );
};

export const ConstructorTemplate: FunctionComponent<Constructor> = ({ def, info }={ def: '' }) => (
  <div className="m-0 p-0 w-100">
    <h5 className="mt-4">Constructor</h5>
    <Table hover striped responsive size="sm">
      <thead>
        <tr>
          <th scope="col">Constructor and Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <p><strong>{ def }</strong></p>
            { info ? info.map((t, i) => <p key={ i }>{ t }</p>) : '' }
          </td>
        </tr>
      </tbody>
    </Table>
  </div>
);

interface EnumTemplateProps {
  enums: Array<Enum>;
}

export const EnumTemplate: FunctionComponent<EnumTemplateProps> = ({ enums }) => (
  <div className="m-0 p-0 w-100">
    <h5 className="mt-4">Enumerations</h5>
    {
      enums.map(e => (
        <div key={ e.header } className="m-0 p-0 w-100">
          <h6 className="mt-4">{ e.header }</h6>
          <Table hover striped responsive size="sm">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Value and Info</th>
              </tr>
            </thead>
            <tbody>
              {
                e.defs.map(d => (
                  <tr key={ d.name }>
                    <td>
                      <p><strong>{ d.name }</strong></p>
                    </td>
                    <td>
                      { d.info.value && <p><strong>{ d.info.value }</strong></p>  }
                      { d.info.info && d.info.info.map((t, k) => <p key={ k }>{ t }</p>) }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </div>
      ))
    }
  </div>
);

interface FunctionTemplateProps {
  fun: Array<FunctionAPI>
}

export const FunctionTemplate: FunctionComponent<FunctionTemplateProps> = ({ fun }) => (
  <div className="m-0 p-0 w-100">
    <h5 className="mt-4">Functions</h5>
    <Table hover striped responsive size="sm">
      <thead>
        <tr>
          <th scope="col">Return type and Info</th>
          <th scope="col">Function and Description</th>
        </tr>
      </thead>
      <tbody>
        {
          fun.map((f, i) => (
            <tr key={ i }>
              <td>
                { f.return.type ? <p><strong>{ f.return.type }</strong></p> : '' }
                { f.return.info ? f.return.info.map((t, j) => <p key={ j }>{ t }</p>) : '' }
              </td>
              <td>
                <p><strong>{ f.fun_desc.def }</strong></p>
                { f.fun_desc.info ? f.fun_desc.info.map((t, k) => <p key={ k }>{ t }</p>) : '' }
              </td>
            </tr>
          ))
        }
      </tbody>
    </Table>
  </div>
);

interface ClassTemplateProps {
  cls: Array<ClassDefinition>
}

export const ClassTemplate: FunctionComponent<ClassTemplateProps> = ({ cls }) => {
  return cls.map(c => {
    const tmpData = {
      ...c,
      id: c.header,
      body: (
        <div className="m-0 p-0 w-100">
          { c.constructor && <ConstructorTemplate { ...c.constructor } /> }
          { c.enum && <EnumTemplate enums={ c.enum } /> }
          { c.function && <FunctionTemplate fun={ c.function } /> }
        </div>
      )
    };
    return <CardTemplate key={ c.header } { ...tmpData } />;
  });
};