import { NAV_EXTERNAL_OPENC2, NAV_EXTERNAL_OPENC2_FAQ, NAV_EXTERNAL_OPENC2_JADN_INFO_MODELING, NAV_EXTERNAL_OPENC2_JADN_PYPI, NAV_EXTERNAL_OPENC2_JADN_SPEC, NAV_EXTERNAL_OPENC2_JADN_SRC } from "components/utils/constants";
import React from "react"

const About = () => {
  return (
    <div className='card'>
      <div className='card-header p-2'>
        <h5 className='m-0'>About</h5>
      </div>
      <div className='card-body p-2'>
        <div className="row">
          <div className='col-md-12'>
            <p className='mt-2'>
              The <b> JADN Sandbox </b> provides the ability to create, convert, translate, transform, and validate JADN compliant schemas.
              In addition, the app provides the ability to create and validate data against a schema, as well as,
              generate test data based on the provided schema.  Within JADN Sandbox users can interact with the JADN information modeling tools and create
              schemas or data based on their application or systems needs or just to learn more about JADN with a hands on approach.
            </p>
          </div>
        </div>
        <div className="row">
          <div className='col-md-8 pr-1'>
            <ul className="list-group">
              <li className="list-group-item bg-primary">
                <b>FAQ</b>
              </li>
              <li className="list-group-item">
                <p><b>What is JADN?</b></p>
                <p>
                  JSON Abstract Data Notation (JADN) is an information modeling language.  It has several
                  purposes including defining data structures, validating data instances, informing user
                  interfaces working with structured data, and facilitating protocol internationalization.
                  JADN specifications consist of two parts:
                </p>
                <ol>
                  <li>Abstract type definitions that are independent
                    of data format. </li>
                  <li>Serialization rules that define how to represent type instances using
                    specific data formats. </li>
                </ol>
              </li>
              <li className="list-group-item">
                <p><b>What is a Schema?</b></p>
                <p>A Schema itself is a structured information object that can be
                  serialized and transferred between applications, documented in multiple formats such as text-based
                  interface definition languages, property tables or diagrams, and translated into concrete
                  schemas used to validate specific data formats.  A schema provides the guidelines for information or data used within a system. </p>
              </li>
              <li className="list-group-item">
                <p><b>What is a JIDL?</b></p>
                <p>JADN Interface Definition Language (IDL) is a textual representation of JADN type definitions" definition in the JADN spec.
                  JIDL provides a human readable format of the JADN information model.
                </p>
              </li>
            </ul>
          </div>
          <div className='col-md-4 pl-1'>
            <ul className="list-group">
              <li className="list-group-item bg-primary">
                <b>References</b>
              </li>
              <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SPEC} target='_blank' rel='noreferrer'>JADN Specification Doc</a></li>
              <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_INFO_MODELING} target='_blank' rel='noreferrer'>Information Modeling with JADN (work in progress)</a></li>
              <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SRC} target='_blank' rel='noreferrer'>JADN Sandbox Source Code</a></li>
              <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_PYPI} target='_blank' rel='noreferrer'>JADN Python Package</a></li>
              <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2} target='_blank' rel='noreferrer'>OpenC2</a>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <a href={NAV_EXTERNAL_OPENC2_FAQ} target='_blank' rel='noreferrer'>FAQ</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
};
export default About;