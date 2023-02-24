import { faInfoCircle, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NAV_EXTERNAL_OASIS_OPEN, NAV_EXTERNAL_OPENC2, NAV_EXTERNAL_OPENC2_JADN_PYPI, NAV_EXTERNAL_OPENC2_JADN_SPEC, NAV_EXTERNAL_OPENC2_JADN_SRC } from "components/utils/constants";
import React from "react"

const About = () => {
      return (
      <div className='card'>
        <div className='card-header p-2'>
          <h5 className='m-0'>About</h5>
        </div>
        <div className='card-body p-2'>
          <div className="row">
            <div className='col-md'>
              <p className='mt-2'>
                The <b> JADN Sandbox </b> provides the ability to generate, convert, and validate OpenC2 compliant schemas and messages.
              </p>
              <p>
                <b> JSON Abstract Data Notation (JADN) </b> is an information modeling language.  It has several
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
              <p>
                A <b> JADN schema </b> itself is a structured information object that can be
                serialized and transferred between applications, documented in multiple formats such as text-based
                interface definition languages, property tables or diagrams, and translated into concrete
                schemas used to validate specific data formats.
              </p>              
            </div>        
          </div>
          <div className="row">
            <div className="col-md-3">
                  <h6>
                    <span>References</span>
                  </h6>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SPEC} target='_blank' rel='noreferrer'>JADN Specification Doc</a></li>
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SRC} target='_blank' rel='noreferrer'>JADN Sandbox Source Code</a></li>
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_PYPI} target='_blank' rel='noreferrer'>JADN Python Package</a></li>
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2} target='_blank' rel='noreferrer'>OpenC2</a></li>                 
                  </ul>                              
            </div>
            <div className="col-md-9">
                  <h6>
                    <span>FAQ</span>
                  </h6>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">Enter one here..... </li>
                    <li className="list-group-item">Enter one here..... </li>
                    <li className="list-group-item">Enter one here..... </li>
                  </ul>                              
            </div>            
          </div>
        </div>
      </div>
      )
};
export default About;